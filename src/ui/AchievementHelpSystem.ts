// UI component types
export interface HelpColors { background: string,
    panel: string;
    text: string;
    subtext: string;
    accent: string;
    highlight: string;
    border: string;
    button: string;
    buttonHover: string ,}

export interface HelpContent { title: string;
    icon: string;
    content: string[] }

export interface HelpContentMap { [key: string]: HelpContent;
    }

export interface TutorialHighlight { x: number,
    y: number;
    width: number;
    height: number ,}

export interface TutorialStep { title: string;
    content: string;
    target: string;
    highlight: TutorialHighlight
    }

export interface HelpState { isVisible: boolean;
    currentSection: string;
    tutorialProgress: number }

/**
 * 実績システムヘルプ・チュートリアルクラス
 */
export class AchievementHelpSystem {
    private achievementManager: any;
    // ヘルプ表示状態
    private isHelpVisible: boolean;
    private currentHelpSection: string;
    private tutorialProgress: number;
    // UI設定
    private padding: number;
    private lineHeight: number;
    // @ts-ignore 将来のセクション間隔調整で使用予定
    private __sectionSpacing: number;
    // 色設定
    private colors: HelpColors;
    // ヘルプコンテンツ
    private helpContent: HelpContentMap;
    // チュートリアルステップ
    private tutorialSteps: TutorialStep[];
    constructor(achievementManager: any) {

        this.achievementManager = achievementManager;
        
        // ヘルプ表示状態
        this.isHelpVisible = false;
        this.currentHelpSection = 'overview';
        this.tutorialProgress = 0;
        
        // UI設定
        this.padding = 20;
        this.lineHeight = 25;
        this.__sectionSpacing = 40;
        
        // 色設定
        this.colors = {''
            background: '#1a1a2e',
            panel: '#16213e',
            text: '#ffffff',
            subtext: '#cccccc',
            accent: '#4CAF50',
            highlight: '#FFD700',
            border: '#333',
            button: '#2196F3';
    ,}

            buttonHover: '#1976D2' }
        };
        // ヘルプコンテンツ
        this.helpContent = this.initializeHelpContent();
        
        // チュートリアルステップ
        this.tutorialSteps = this.initializeTutorialSteps();
        
        this.initialize();
    }
    
    /**
     * ヘルプシステムを初期化
     */''
    private initialize()';
        console.log('Achievement, Help System, initialized');
    }
    
    /**
     * ヘルプコンテンツを初期化'
     */''
    private initializeHelpContent(''';
                title: '実績システム概要',
                icon: '🏆',
                content: ['';
                    '実績システムでは、ゲームプレイ中の様々な行動や達成によってポイント（AP）を獲得できます。',
                    '',
                    '🎯 実績の種類：',
                    '• スコア系：スコア獲得や高得点達成',
                    '• プレイ系：プレイ時間や連続ログイン',
                    '• テクニック系：コンボや精度向上',
                    '• コレクション系：様々なバブルの破壊',
                    '• スペシャル系：特別な条件クリア',
                    '',
                    '🏅 レアリティ：',
                    '• Common（普通）：基本的な実績',
                    '• Rare（レア）：少し難しい実績',
                    '• Epic（エピック）：かなり難しい実績',]';
                    '• Legendary（レジェンダリー）：最高難易度の実績'];
                ];
            },

            categories: { ''
                title: '実績カテゴリ詳細',
                icon: '📂',
                content: ['';
                    '実績は5つのカテゴリに分類されています：',
                    '',
                    '🎯 スコア系実績：',
                    '• 初回スコア獲得から数万点の高得点まで',
                    '• スコア倍率を活用した高効率獲得',
                    '• 単発高得点とコンボによる累積どちらも重要',
                    '',
                    '⏰ プレイ系実績：',
                    '• 総プレイ時間の積み重ね',
                    '• 連続ログインボーナス',
                    '• 長時間プレイと短時間集中プレイ',
                    '',
                    '🎮 テクニック系実績：',
                    '• コンボ継続と最大コンボ記録',
                    '• バブル破壊精度の向上',
                    '• 特殊バブルの効果的な活用',
                    '',
                    '🎨 コレクション系実績：',
                    '• 全18種類のバブルタイプ破壊',
                    '• 各バブルタイプの大量破壊',
                    '• レアバブルの発見と破壊',
                    '',
                    '⭐ スペシャル系実績：',
                    '• 隠し条件やイースターエッグ',
                    '• 特別なプレイスタイルでの達成',]';
                    '• 季節限定やイベント実績'];
                ] },

            progress: { ''
                title: '進捗と解除条件',
                icon: '📊',
                content: ['';
                    '実績の進捗確認と解除のポイント：',
                    '',
                    '📈 進捗の確認方法：',
                    '• 実績画面で各実績の進捗率を確認',
                    '• 未解除実績は進捗バーで現在の状況を表示',
                    '• カテゴリフィルターで特定分野の実績を絞り込み',
                    '',
                    '🔓 解除条件のヒント：',
                    '• 一部の実績は複数条件を同時に満たす必要',
                    '• 累積型実績は継続的なプレイで少しずつ進歩',
                    '• 瞬間型実績は特定の瞬間に条件を満たす必要',
                    '',
                    '⚡ 効率的な実績解除：',
                    '• 同時進行可能な実績を意識してプレイ',
                    '• 特殊バブルの出現パターンを覚える',
                    '• 高倍率ボーナス時間を有効活用',
                    '',
                    '💡 隠し実績について：',
                    '• 一部の実績は条件が明示されていません',
                    '• 様々なプレイスタイルを試すことで発見',]';
                    '• コミュニティ情報も参考にしてみてください'];
                ] },

            rewards: { ''
                title: '報酬とAP活用',
                icon: '💎',
                content: ['';
                    'AP（Awaputi Points）の獲得と活用方法：',
                    '',
                    '💰 AP獲得量：',
                    '• Common実績：5-20 AP',
                    '• Rare実績：25-50 AP',
                    '• Epic実績：75-150 AP',
                    '• Legendary実績：200-500 AP',
                    '',
                    '🛍️ APの使い道：',
                    '• ショップでゲーム内アイテム購入',
                    '• バブル出現率変更アイテム',
                    '• スコア倍率アップアイテム',
                    '• 時間延長アイテム',
                    '',
                    '📊 AP効率化のコツ：',
                    '• 複数実績の同時解除を狙う',
                    '• 高レアリティ実績への挑戦',
                    '• デイリー・ウィークリー実績の活用',
                    '',
                    '🎁 特別報酬：',
                    '• 一部の実績では限定アイテムも獲得',
                    '• 完全達成での特別称号',]';
                    '• カテゴリ完全制覇での追加ボーナス'];
                ] },

            tips: { ''
                title: '攻略のコツ',
                icon: '💡',
                content: ['';
                    '実績解除を効率化するテクニック：',
                    '',
                    '🎯 基本戦略：',
                    '• 毎日少しずつでも継続プレイ',
                    '• 様々なバブルタイプを意識的に狙う',
                    '• コンボ継続を心がける',
                    '• 特殊バブル効果のタイミングを覚える',
                    '',
                    '⚡ 高効率テクニック：',
                    '• Rainbow バブルでボーナスタイム発動',
                    '• Clock バブルで時間停止を戦略的に使用',
                    '• Electric バブルのリスクを理解して回避',
                    '• Boss バブルの高得点を積極的に狙う',
                    '',
                    '🔄 リスク管理：',
                    '• Poison バブルの回避方法',
                    '• HP管理と Pink バブルでの回復',
                    '• Escaping バブルの予測移動',
                    '• Spiky バブルの連鎖ダメージ対策',
                    '',
                    '📱 デバイス別コツ：',
                    '• PC：マウスの精密な操作活用',
                    '• タブレット：大画面でのバブル識別',
                    '• スマートフォン：タッチ操作の最適化',
                    '',
                    '🏆 上級者向け：',
                    '• 複数実績の同時進行計画',
                    '• スコア最大化のルート構築',
                    '• レアバブル出現パターンの分析',]';
                    '• パーフェクトクリア条件の把握'];
                ] },

            faq: { ''
                title: 'よくある質問',
                icon: '❓',
                content: ['';
                    'Q: 実績データが消えてしまいました',
                    'A: ブラウザのLocalStorageに保存されています。ブラウザデータクリア時に削除される可能性があります。定期的なデータエクスポートをお勧めします。',
                    '',
                    'Q: 実績の進捗が反映されません',
                    'A: ページを再読み込みしてください。それでも解決しない場合はブラウザの互換性を確認してください。',
                    '',
                    'Q: 隠し実績の条件がわかりません',
                    'A: 隠し実績は発見する楽しみも含まれています。様々なプレイスタイルを試してみてください。',
                    '',
                    'Q: APが正しく加算されません',
                    'A: 実績解除時に自動的に加算されます。表示更新には少し時間がかかる場合があります。',
                    '',
                    'Q: 通知が表示されません',
                    'A: ブラウザの音声設定を確認してください。また、タブがアクティブでない場合は制限される可能性があります。',
                    '',
                    'Q: モバイルで操作しにくいです',
                    'A: ピンチズームでゲーム画面を拡大できます。また、設定から感度調整も可能です。',
                    '',
                    'Q: 実績の並び順を変更できますか',
                    'A: カテゴリフィルターで絞り込みが可能です。ソート機能は今後の更新で対応予定です。',
                    '',
                    'Q: データのバックアップ方法は？',]';
                    'A: ユーザー情報画面からデータエクスポート機能をご利用ください。'];
                ] ,}
        }
    
    /**
     * チュートリアルステップを初期化'
     */''
    private initializeTutorialSteps(''';
                title: 'ようこそ実績システムへ！',
                content: 'ゲームプレイで様々な実績を解除してAPを獲得しましょう。',
                target: 'achievement-overview';
                highlight: { x: 100, y: 100, width: 200, height: 50 ,},

            { ''
                title: '実績カテゴリ',
                content: '実績は5つのカテゴリに分類されています。フィルターで絞り込めます。',
                target: 'category-filter', }
                highlight: { x: 50, y: 50, width: 300, height: 40 ,},

            { ''
                title: '進捗確認',
                content: '未解除実績は進捗バーで現在の状況を確認できます。',
                target: 'progress-bar', }
                highlight: { x: 150, y: 200, width: 250, height: 30 ,},

            { ''
                title: '実績解除！',
                content: '条件を満たすと実績が解除され、APが獲得できます。',
                target: 'achievement-unlock', }
                highlight: { x: 200, y: 150, width: 300, height: 80 ,}))'
            { ''
                title: 'AP活用',
                content: '獲得したAPはショップでアイテム購入に使用できます。',
                target: 'ap-display', }
                highlight: { x: 300, y: 50, width: 150, height: 30 ,}
        ];
    }
    
    /**
     * ヘルプを表示'
     */''
    public showHelp(section: string = 'overview): void { this.isHelpVisible = true;
        this.currentHelpSection = section; }
    
    /**
     * ヘルプを非表示
     */
    public hideHelp(): void { this.isHelpVisible = false; }
    
    /**
     * チュートリアルを開始'
     */''
    public startTutorial()';
        this.showHelp('tutorial);
    }
    
    /**
     * チュートリアルを次のステップに進める
     */
    public nextTutorialStep(): void { this.tutorialProgress++;
        if(this.tutorialProgress >= this.tutorialSteps.length) {
            
        }
            this.completeTutorial(); }
}
    
    /**
     * チュートリアルを完了
     */
    public completeTutorial(): void { this.hideHelp();
        this.tutorialProgress = 0;
        ';
        // チュートリアル完了実績をトリガー
        if(this.achievementManager) {'
            ';

        }

            this.achievementManager.updateProgress('tutorial_completed', 1); }
}
    
    /**
     * ヘルプセクションを変更
     */
    public changeHelpSection(section: string): void { if (this.helpContent[section]) {
            this.currentHelpSection = section; }
    }
    
    /**
     * ヘルプシステムを描画
     */
    public render(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void { if (!this.isHelpVisible) return;

        context.save()';
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';''
        context.fillRect(0, 0, canvas.width, canvas.height);

        if(this.currentHelpSection === 'tutorial) {'
            
        }
            this.renderTutorial(context, canvas); }
        } else { this.renderHelpContent(context, canvas); }
        
        context.restore();
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    private renderHelpContent(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void { const panelWidth = Math.min(700, canvas.width - 40);
        const panelHeight = Math.min(500, canvas.height - 40);
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        // ヘルプパネル背景
        context.fillStyle = this.colors.panel;
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // 枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 2;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // ヘルプナビゲーション
        this.renderHelpNavigation(context, panelX, panelY, panelWidth);
        
        // ヘルプコンテンツ本体
        this.renderHelpText(context, panelX, panelY + 60, panelWidth, panelHeight - 120);
        
        // 閉じるボタン
        this.renderCloseButton(context, panelX + panelWidth - 40, panelY + 10); }
    
    /**
     * ヘルプナビゲーションを描画
     */
    private renderHelpNavigation(context: CanvasRenderingContext2D, x: number, y: number, width: number): void { const navHeight = 50;
        const buttonWidth = width / Object.keys(this.helpContent).length;
        
        Object.keys(this.helpContent).forEach((section, index) => { 
            const buttonX = x + index * buttonWidth;
            const isActive = section === this.currentHelpSection;
            
            // ボタン背景
            context.fillStyle = isActive ? this.colors.accent: this.colors.button,
            context.fillRect(buttonX, y, buttonWidth, navHeight);
            
            // ボタン枠線
            context.strokeStyle = this.colors.border;
            context.lineWidth = 1;''
            context.strokeRect(buttonX, y, buttonWidth, navHeight);
            
            // ボタンテキスト
            const content = this.helpContent[section];
            context.fillStyle = this.colors.text;''
            context.font = '14px Arial';''
            context.textAlign = 'center';''
            context.textBaseline = 'middle'; }
            context.fillText() }
                `${content.icon} ${ content.title}`,
                buttonX + buttonWidth / 2,
                y + navHeight / 2 });
        });
    }
    
    /**
     * ヘルプテキストを描画
     */'
    private renderHelpText(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { const content = this.helpContent[this.currentHelpSection];''
        if(!content) return;
        
        const padding = this.padding;
        const textX = x + padding;
        let currentY = y + padding;
        ';

        context.fillStyle = this.colors.text;''
        context.font = '14px Arial';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';
        ';

        content.content.forEach(line => { );''
            if(currentY + this.lineHeight > y + height - padding) return;

            if(line === ''') {
                
            }
                currentY += this.lineHeight / 2; }
                return; }
            }
            ';
            // 特殊な書式設定
            if (line.startsWith('🎯 '') || line.startsWith('⏰ '') || '';
                line.startsWith('🎮 '') || line.startsWith('🎨 '') || '';
                line.startsWith('⭐ '') || line.startsWith('💰 '') || '';
                line.startsWith('🛍️ '') || line.startsWith('📊 '') ||'';
                line.startsWith('🎁 ')) { context.fillStyle = this.colors.highlight;''
                context.font = 'bold 14px Arial';' }

            } else if(line.startsWith('• ')) { context.fillStyle = this.colors.subtext;''
                context.font = '13px Arial';' }

            } else if(line.startsWith('Q: ')) { context.fillStyle = this.colors.accent;''
                context.font = 'bold 14px Arial';' }

            } else if(line.startsWith('A: ')) { context.fillStyle = this.colors.text;''
                context.font = '14px Arial'; }

            } else {  context.fillStyle = this.colors.text;' }'

                context.font = '14px Arial'; }
            }
            
            // 文字列の折り返し処理
            this.renderWrappedText(context, line, textX, currentY, width - padding * 2);
            currentY += this.lineHeight;
        });
    }
    
    /**
     * チュートリアルを描画
     */
    private renderTutorial(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void { if (this.tutorialProgress >= this.tutorialSteps.length) return;
        
        const step = this.tutorialSteps[this.tutorialProgress];
        
        // ハイライト領域
        if(step.highlight) {
            const h = step.highlight;
            
            // ハイライト背景をクリア
            context.clearRect(h.x, h.y, h.width, h.height);
            
            // ハイライト枠線
            context.strokeStyle = this.colors.highlight;
            context.lineWidth = 3;
            context.strokeRect(h.x - 5, h.y - 5, h.width + 10, h.height + 10);
            
            // パルス効果
            const pulseAlpha = 0.3 + 0.3 * Math.sin(Date.now() * 0.005);
        }
            context.fillStyle = `rgba(255, 215, 0, ${pulseAlpha}`; }
            context.fillRect(h.x - 5, h.y - 5, h.width + 10, h.height + 10});
        }
        
        // チュートリアルパネル
        const panelWidth = 350;
        const panelHeight = 150;
        const panelX = canvas.width - panelWidth - 20;
        const panelY = 20;
        
        // パネル背景
        context.fillStyle = this.colors.panel;
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // パネル枠線
        context.strokeStyle = this.colors.accent;
        context.lineWidth = 2;''
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // タイトル
        context.fillStyle = this.colors.highlight;''
        context.font = 'bold 16px Arial';''
        context.textAlign = 'left';''
        context.fillText(step.title, panelX + 15, panelY + 25);
        
        // 内容
        context.fillStyle = this.colors.text;''
        context.font = '14px Arial';''
        this.renderWrappedText(context, step.content, panelX + 15, panelY + 50, panelWidth - 30);
        
        // プログレス表示
        context.fillStyle = this.colors.subtext;''
        context.font = '12px Arial';''
        context.textAlign = 'right';
        context.fillText();
            `${this.tutorialProgress + 1} / ${ this.tutorialSteps.length)`,
            panelX + panelWidth - 15,
            panelY + panelHeight - 15'';
        '};

        // 次へボタン
        const buttonY = panelY + panelHeight - 40;''
        this.renderTutorialButton(context, panelX + panelWidth - 80, buttonY, '次へ''};
        ';

        // スキップボタン' }'

        this.renderTutorialButton(context, panelX + panelWidth - 150, buttonY, 'スキップ'});
    }
    
    /**
     * チュートリアルボタンを描画
     */
    private renderTutorialButton(context: CanvasRenderingContext2D, x: number, y: number, text: string): void { const buttonWidth = 60;
        const buttonHeight = 25;
        
        // ボタン背景
        context.fillStyle = this.colors.button;
        context.fillRect(x, y, buttonWidth, buttonHeight);
        
        // ボタン枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;''
        context.strokeRect(x, y, buttonWidth, buttonHeight);
        
        // ボタンテキスト
        context.fillStyle = this.colors.text;''
        context.font = '12px Arial';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';
        context.fillText(text, x + buttonWidth / 2, y + buttonHeight / 2); }
    
    /**
     * 閉じるボタンを描画
     */
    private renderCloseButton(context: CanvasRenderingContext2D, x: number, y: number): void { const buttonSize = 20;
        
        // ボタン背景
        context.fillStyle = this.colors.button;
        context.fillRect(x, y, buttonSize, buttonSize);
        
        // X マーク
        context.strokeStyle = this.colors.text;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x + 5, y + 5);
        context.lineTo(x + 15, y + 15);
        context.moveTo(x + 15, y + 5);
        context.lineTo(x + 5, y + 15);
        context.stroke(); }
    
    /**
     * 文字列の折り返し描画
     */''
    private renderWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number): void { ''
        const words = text.split(' '');''
        let line = '';
        let currentY = y;

        for(let, n = 0; n < words.length; n++) {'

            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            ';

            if (testWidth > maxWidth && n > 0) {''
                context.fillText(line, x, currentY);''
                line = words[n] + ' ';
        }
                currentY += this.lineHeight; }
            } else { line = testLine; }
        }
        context.fillText(line, x, currentY);
    }
    
    /**
     * マウスクリック処理'
     */'
    public handleClick(x: number, y: number, canvas: HTMLCanvasElement): boolean { ''
        if(!this.isHelpVisible) return false;

        if(this.currentHelpSection === 'tutorial) {'
            
        }
            return this.handleTutorialClick(x, y, canvas); else { return this.handleHelpClick(x, y, canvas);
    
    /**
     * ヘルプクリック処理
     */
    private handleHelpClick(x: number, y: number, canvas: HTMLCanvasElement): boolean { const panelWidth = Math.min(700, canvas.width - 40);
        const panelHeight = Math.min(500, canvas.height - 40);
        const panelX = (canvas.width - panelWidth) / 2;
        const panelY = (canvas.height - panelHeight) / 2;
        
        // 閉じるボタンクリック
        const closeX = panelX + panelWidth - 40;
        const closeY = panelY + 10;
        if(x >= closeX && x <= closeX + 20 && y >= closeY && y <= closeY + 20) {
            this.hideHelp();
        }
            return true;
        
        // ナビゲーションボタンクリック
        const navHeight = 50;
        const buttonWidth = panelWidth / Object.keys(this.helpContent).length;
        
        if(y >= panelY && y <= panelY + navHeight) {
        
            const buttonIndex = Math.floor((x - panelX) / buttonWidth);
            const sections = Object.keys(this.helpContent);
            
            if (buttonIndex >= 0 && buttonIndex < sections.length) {
                this.changeHelpSection(sections[buttonIndex]);
        
        }
                return true;
        
        return false;
    }
    
    /**
     * チュートリアルクリック処理
     */
    private handleTutorialClick(x: number, y: number, canvas: HTMLCanvasElement): boolean { const panelWidth = 350;
        const panelHeight = 150;
        const panelX = canvas.width - panelWidth - 20;
        const panelY = 20;
        const buttonY = panelY + panelHeight - 40;
        
        // 次へボタン
        const nextX = panelX + panelWidth - 80;
        if(x >= nextX && x <= nextX + 60 && y >= buttonY && y <= buttonY + 25) {
            this.nextTutorialStep();
        }
            return true;
        
        // スキップボタン
        const skipX = panelX + panelWidth - 150;
        if(x >= skipX && x <= skipX + 60 && y >= buttonY && y <= buttonY + 25) {
            this.completeTutorial();
        }
            return true;
        
        return false;
    }
    
    /**
     * ヘルプの状態を取得
     */
    public getHelpState(): HelpState { return { isVisible: this.isHelpVisible,
            currentSection: this.currentHelpSection, };
            tutorialProgress: this.tutorialProgress }
        }
    
    /**
     * コンテキストヘルプを表示
     */
    public showContextHelp(achievementId: string): void { const achievement = this.achievementManager? .getAchievement(achievementId);
        if (!achievement) return;
        // 該当実績のカテゴリに応じたヘルプセクションを表示
        const category = this.achievementManager.getAchievementCategory(achievementId); : undefined 
        const sectionMap: { [key: string]: string ,} = { ''
            'score': 'categories',
            'play': 'categories',
            'technique': 'tips',
            'collection': 'categories',
            'special': 'tips' };

        this.showHelp(sectionMap[category] || 'overview'');

    }''
}