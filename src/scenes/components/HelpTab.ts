/**
 * ヘルプタブコンポーネント
 * UserInfoSceneのヘルプ機能を担当
 */
import { TabComponent } from './TabComponent';''
import { GameEngine } from '../../core/GameEngine';''
import { ComponentEventBus } from './ComponentEventBus';''
import { SceneState } from './SceneState';

interface HelpSectionContent { title: string,
    content: string[] }
}

interface HelpContent { [sectionId: string]: HelpSectionContent,
    }
}

interface SectionChangeEvent { oldSection: string,
    newSection: string }
}

interface TextSettings { titleFont: string,
    headerFont: string,
    contentFont: string,
    titleColor: string,
    headerColor: string,
    contentColor: string,
    questionColor: string,
    answerColor: string }
}
';
export class HelpTab extends TabComponent { // ヘルプセクション
    private readonly helpSections: string[] = ['overview', 'categories', 'progress', 'rewards', 'tips', 'faq'];''
    private readonly helpSectionLabels: string[] = ['概要', 'カテゴリ', '進捗', '報酬', 'ヒント', 'FAQ'];''
    private currentHelpSection: string = 'overview';
    // ヘルプコンテンツ
    private helpContent: HelpContent | null = null;
    private contentRenderer: HelpContentRenderer | null = null;
    // UI状態
    private scrollPosition: number = 0;
    private maxScrollPosition: number = 0;
    // レイアウト設定
    private readonly sectionButtonHeight: number = 40,
    private readonly contentPadding: number = 20,
    private readonly lineHeight: number = 20,
    
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
    
        
    
    }
        super(gameEngine, eventBus, state); }
    }
    
    /**
     * コンポーネントの初期化
     */
    initialize(): void { super.initialize();
        
        // ヘルプシステムから既存のデータを取得
        if ((this.gameEngine as any).achievementManager) {
            this.initializeHelpContent(); }
        }
        
        // ヘルプコンテンツレンダラーを作成
        this.contentRenderer = new HelpContentRenderer(this.gameEngine, this.eventBus, this.state);
        this.contentRenderer.initialize();
    }
    
    /**
     * ヘルプコンテンツを初期化
     */''
    private initializeHelpContent(''';
                    title: '実績システム概要',';
                    content: ['';
                        'このゲームには豊富な実績システムが用意されています。','';
                        '実績を解除することで、追加のAP（Awaputi Points）を獲得できます。','';
                        '','';
                        '主な実績カテゴリ：','';
                        '• スコア系 - 高スコア達成で解除','';
                        '• プレイ系 - ゲームプレイ回数で解除','';
                        '• テクニック系 - 特定の技術で解除','';
                        '• コレクション系 - アイテムコレクションで解除',']';
                        '• 特殊系 - 隠れた条件で解除'];
                    ];
                },'
                categories: { ''
                    title: '実績カテゴリ詳細',';
                    content: ['';
                        '【スコア系実績】','';
                        '高スコアを達成することで解除される実績です。','';
                        '初心者から上級者まで幅広い難易度があります。','';
                        '','';
                        '【プレイ系実績】','';
                        'ゲームプレイ回数や継続プレイで解除されます。','';
                        '毎日プレイすることで獲得しやすくなります。','';
                        '','';
                        '【テクニック系実績】','';
                        'コンボやスペシャルテクニックで解除されます。','';
                        '上級者向けの挑戦的な実績が多数あります。','';
                        '','';
                        '【コレクション系実績】','';
                        'アイテムの収集や特定の組み合わせで解除されます。','';
                        'ショップでアイテムを購入して進めましょう。','';
                        '','';
                        '【特殊系実績】','';
                        '隠れた条件や特別なイベントで解除されます。',']';
                        '探索心旺盛なプレイヤーにおすすめです。'];
                    ] }
                },'
                progress: { ''
                    title: '進捗の確認方法',';
                    content: ['';
                        '実績の進捗は実績タブで確認できます。','';
                        '','';
                        '【進捗の見方】','';
                        '• 緑色: 解除済みの実績','';
                        '• 青色: 進行中の実績（プログレスバー表示）','';
                        '• グレー: 未開始の実績','';
                        '','';
                        '【フィルター機能】','';
                        'カテゴリ別にフィルターをかけて表示できます。','';
                        '「全て」を選択すると全カテゴリが表示されます。','';
                        '','';
                        '【統計情報】','';
                        '実績統計で全体の達成率を確認できます。',']';
                        '獲得したAPの合計も表示されます。'];
                    ] }
                },'
                rewards: { ''
                    title: '報酬システム',';
                    content: ['';
                        '実績を解除すると様々な報酬が獲得できます。','';
                        '','';
                        '【AP（Awaputi Points）】','';
                        '実績解除で獲得できる基本的な報酬です。','';
                        'ショップでアイテム購入に使用できます。','';
                        '','';
                        '【実績ランク】','';
                        'Bronze: 10-20 AP','';
                        'Silver: 30-50 AP','';
                        'Gold: 60-100 AP','';
                        'Platinum: 150+ AP','';
                        '','';
                        '【特別報酬】','';
                        '一部の実績では特別なアイテムも獲得できます。','';
                        'レアアイテムは特定の実績でのみ入手可能です。','';
                        '','';
                        '【タイトル】','';
                        '特別な実績を解除すると称号が獲得できます。',']';
                        'プロフィールに表示して自慢しましょう。'];
                    ] }
                },'
                tips: { ''
                    title: '実績獲得のコツ',';
                    content: ['';
                        '効率的に実績を獲得するためのヒントをご紹介します。','';
                        '','';
                        '【基本的なコツ】','';
                        '• 毎日少しずつでもプレイを続ける','';
                        '• 簡単な実績から順番にクリアする','';
                        '• 進捗を定期的にチェックする','';
                        '','';
                        '【上級者向けテクニック】','';
                        '• コンボ系実績は練習モードで練習','';
                        '• スコア系実績はアイテムを活用','';
                        '• 効率の良いステージを選択','';
                        '','';
                        '【隠し要素】','';
                        '• 特定の日時にプレイすると解除される実績','';
                        '• 特殊な操作パターンで解除される実績','';
                        '• イースターエッグ的な実績','';
                        '','';
                        '【コミュニティ情報】','';
                        '攻略情報は公式フォーラムで共有されています。',']';
                        '他のプレイヤーとの情報交換も有効です。'];
                    ] }
                },'
                faq: { ')'
                    title: 'よくある質問')';
                    content: ['';
                        '【Q: 実績が解除されません】','';
                        'A: 条件を正確に満たしているか確認してください。','';
                        '   一部の実績は複数回の条件達成が必要です。','';
                        '','';
                        '【Q: 進捗がリセットされました】','';
                        'A: データが破損している可能性があります。','';
                        '   データ管理タブから復旧を試してください。','';
                        '','';
                        '【Q: 新しい実績が追加されますか？】','';
                        'A: アップデートで定期的に新実績が追加されます。','';
                        '   アップデート情報をチェックしてください。','';
                        '','';
                        '【Q: 実績の条件がわかりません】','';
                        'A: 一部の実績は意図的に条件を隠しています。','';
                        '   プレイを続けて条件を発見してください。','';
                        '','';
                        '【Q: APが正しく加算されません】','';
                        'A: ゲームを再起動して確認してください。','';
                        '   問題が続く場合はデータ検証を実行してください。','';
                        '','';
                        '【Q: 実績統計が表示されません】','';
                        'A: 統計データの生成に時間がかかる場合があります。',']';
                        '   しばらく待ってから再度確認してください。'];
                    ] }
                }'
            };''
        } catch (error) { ''
            console.error('Help content initialization error:', error);
            this.helpContent = this.createFallbackContent(); }
        }
    }
    
    /**
     * フォールバックコンテンツを作成'
     */''
    private createFallbackContent()';
                title: 'ヘルプ')';
                content: ['';
                    'ヘルプコンテンツの読み込みに失敗しました。',']';
                    'ゲームを再起動して再度お試しください。'];
                ];
            }
        };
    }
    
    /**
     * レンダリング処理
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { try {
            if (!this.isActive) return;
            
            // 背景を描画
            this.renderBackground(context, x, y, width, height);
            
            // ヘルプセクションセレクターを描画
            const selectorHeight = this.renderHelpSectionSelector(context, x, y, width);
            
            // ヘルプコンテンツを描画
            const contentY = y + selectorHeight + 10;
            const contentHeight = height - selectorHeight - 10;
            this.renderHelpContent(context, x, contentY, width, contentHeight);
            
            // スクロールバーを描画
            this.renderScrollbar(context, x + width - 16, contentY, 16, contentHeight);
             }
        } catch (error) { this.renderErrorFallback(context, x, y, width, height, error as Error); }
        }
    }
    
    /**
     * 背景を描画
     */''
    private renderBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number'): void { ''
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA';''
        context.fillRect(x, y, width, height');'
        '';
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height); }
    }
    
    /**
     * ヘルプセクションセレクターを描画
     */'
    private renderHelpSectionSelector(context: CanvasRenderingContext2D, x: number, y: number, width: number): number { const selectorHeight = this.sectionButtonHeight + 20;''
        const buttonWidth = Math.min(100, (width - this.contentPadding * 2) / this.helpSections.length - 10');
        const buttonY = y + 10;'
        '';
        context.font = this.accessibilitySettings.largeText ? '14px sans-serif' : '12px sans-serif';
        
        for(let i = 0; i < this.helpSections.length; i++) {
        
            const section = this.helpSections[i];'
            const label = this.helpSectionLabels[i];''
            const buttonX = x + this.contentPadding + i * (buttonWidth + 10');
            const isActive = this.currentHelpSection === section;
            ';
            // ボタン背景
            context.fillStyle = isActive ? '#007BFF' : '#E9ECEF';'
            this.roundRect(context, buttonX, buttonY, buttonWidth, this.sectionButtonHeight, 4);''
            context.fill(''';
            context.strokeStyle = isActive ? '#0056B3' : '#CED4DA';)
            context.lineWidth = 1;)'
            this.roundRect(context, buttonX, buttonY, buttonWidth, this.sectionButtonHeight, 4);''
            context.stroke(''';
            context.fillStyle = isActive ? '#FFFFFF' : '#495057';''
            context.textAlign = 'center';')'
            context.textBaseline = 'middle';)
        
        }
            context.fillText(label, buttonX + buttonWidth / 2, buttonY + this.sectionButtonHeight / 2); }
        }
        
        return selectorHeight;
    }
    
    /**
     * ヘルプコンテンツを描画
     */
    private renderHelpContent(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { if (!this.helpContent) return;
        ';'
        const currentSection = this.helpContent[this.currentHelpSection];''
        if (!currentSection') return;
        
        const contentX = x + this.contentPadding;
        const contentWidth = width - this.contentPadding * 2 - 20; // スクロールバー分を除く
        let currentY = y + this.contentPadding - this.scrollPosition;
        ;
        // タイトル描画
        context.font = this.accessibilitySettings.largeText ? '20px bold sans-serif' : '18px bold sans-serif';''
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#212529';''
        context.textAlign = 'left';''
        context.textBaseline = 'top';
        
        if(currentY + 30 > y && currentY < y + height) {
        ';'
            ';'
        }'
            context.fillText(currentSection.title, contentX, currentY'); }
        }
        currentY += 40;
        ';
        // コンテンツ描画
        context.font = this.accessibilitySettings.largeText ? '16px sans-serif' : '14px sans-serif';''
        context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#495057';
        
        for(const line of currentSection.content) {
        ';'
            '';
            if (currentY > y + height') break; // 表示領域外は描画をスキップ
            '';
            if (line === ''') {
                // 空行
        
        }
                currentY += this.lineHeight;' }'
            } else if (line.startsWith('【'') && line.endsWith('】') { // セクションヘッダー
                if(currentY + this.lineHeight > y') {'
                    '';
                    context.font = this.accessibilitySettings.largeText ? '16px bold sans-serif' : '14px bold sans-serif';''
                    context.fillStyle = '#007BFF';''
                    context.fillText(line, contentX, currentY');''
                    context.font = this.accessibilitySettings.largeText ? '16px sans-serif' : '14px sans-serif';'
                }'
                    context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#495057'; }
                }'
                currentY += this.lineHeight + 5;''
            } else if (line.startsWith('•'') || line.startsWith('Q:'') || line.startsWith('A:') { // リストアイテムや質問回答
                if(currentY + this.lineHeight > y') {'
                    '';
                    const textColor = line.startsWith('Q:'') ? '#DC3545' : '';
                                     line.startsWith('A: '') ? '#28A745' : '#495057','';
                    context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : textColor;''
                    this.renderWrappedText(context, line, contentX + 10, currentY, contentWidth - 10');'
                }'
                    context.fillStyle = this.accessibilitySettings.highContrast ? '#000000' : '#495057'; }
                }
                currentY += this.lineHeight + 2;
            } else {  // 通常のテキスト
                if (currentY + this.lineHeight > y) { }
                    this.renderWrappedText(context, line, contentX, currentY, contentWidth); }
                }
                currentY += this.lineHeight;
            }
        }
        
        // 最大スクロール位置を更新
        this.maxScrollPosition = Math.max(0, currentY + this.scrollPosition - (y + height - this.contentPadding);
    }
    
    /**
     * 折り返しテキストを描画
     */''
    private renderWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number'): number { ''
        const words = text.split(''');''
        let line = '';
        let currentY = y;
        
        for(let i = 0; i < words.length; i++) {
        ';'
            const testLine = line + words[i];''
            const metrics = context.measureText(testLine');'
            '';
            if (metrics.width > maxWidth && line !== '') {''
                context.fillText(line, x, currentY');
                line = words[i];
        
        }
                currentY += this.lineHeight; }
            } else { line = testLine; }
            }
        }'
        '';
        if (line !== '') { context.fillText(line, x, currentY); }
        }
        
        return currentY + this.lineHeight;
    }
    
    /**
     * スクロールバーを描画
     */'
    private renderScrollbar(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { ''
        if (this.maxScrollPosition <= 0') return;
        ';
        // スクロールバー背景
        context.fillStyle = '#E9ECEF';
        context.fillRect(x, y, width, height);
        
        // スクロールバートラック
        const trackHeight = height * (height / (height + this.maxScrollPosition));''
        const trackY = y + (this.scrollPosition / this.maxScrollPosition) * (height - trackHeight');'
        '';
        context.fillStyle = '#6C757D';''
        context.fillRect(x + 2, trackY, width - 4, trackHeight');
        ';
        // スクロールバー枠線
        context.strokeStyle = '#CED4DA';
        context.lineWidth = 1;
        context.strokeRect(x, y, width, height); }
    }
    
    /**
     * クリック処理
     */
    handleClick(x: number, y: number): boolean { if (!this.isActive) return false;
        
        // ヘルプセクションボタンのクリック判定
        const selectorHeight = this.sectionButtonHeight + 20;
        if(y <= selectorHeight) {
            
        }
            return this.handleSectionClick(x, y); }
        }
        
        return false;
    }
    
    /**
     * セクションボタンクリック処理
     */
    private handleSectionClick(x: number, y: number): boolean { const buttonWidth = Math.min(100, (800 - this.contentPadding * 2) / this.helpSections.length - 10);
        const buttonY = 10;
        
        if(y >= buttonY && y <= buttonY + this.sectionButtonHeight) {
        
            for (let i = 0; i < this.helpSections.length; i++) {
                const buttonX = this.contentPadding + i * (buttonWidth + 10);
                
                if (x >= buttonX && x <= buttonX + buttonWidth) {
                    this.changeHelpSection(this.helpSections[i]);
        
        }
                    return true; }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 入力処理
     */
    handleInput(event: Event): boolean { ''
        if (!this.isActive') return false;'
        '';
        if(event.type === 'keydown') {'
            const keyEvent = event as KeyboardEvent;''
            switch (keyEvent.key') {''
                case 'ArrowUp':';
                    keyEvent.preventDefault();''
                    this.scroll(-this.lineHeight * 3');
                    return true;'
                    '';
                case 'ArrowDown':';
                    keyEvent.preventDefault();''
                    this.scroll(this.lineHeight * 3');
                    return true;'
                    '';
                case 'PageUp':';
                    keyEvent.preventDefault();''
                    this.scroll(-200');
                    return true;'
                    '';
                case 'PageDown':';
                    keyEvent.preventDefault();''
                    this.scroll(200');
                    return true;'
                    '';
                case 'Home':'';
                    keyEvent.preventDefault(''';
                case 'End':';
        })'
                    keyEvent.preventDefault() }'
        } else if (event.type === 'wheel') { const wheelEvent = event as WheelEvent;
            wheelEvent.preventDefault();
            this.scroll(wheelEvent.deltaY);
            return true; }
        }
        
        return false;
    }
    
    /**
     * ヘルプセクションを変更
     */'
    private changeHelpSection(section: string): void { ''
        if (this.helpSections.includes(section)') {
            const oldSection = this.currentHelpSection;
            this.currentHelpSection = section;
            this.scrollPosition = 0; // スクロール位置をリセット
            
            // イベント通知
            const eventData: SectionChangeEvent = {
                oldSection,
                newSection: section }
            };''
            this.eventBus.emit('help-section-changed', eventData);
        }
    }
    
    /**
     * スクロール処理
     */
    private scroll(delta: number): void { this.scrollPosition = Math.max(0, Math.min(this.maxScrollPosition, this.scrollPosition + delta); }
    }
    
    /**
     * 角丸矩形を描画
     */
    private roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void { context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath(); }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void { super.cleanup();
        
        if(this.contentRenderer) {
        ';'
            '';
            this.contentRenderer.cleanup(''';
        titleFont: '18px bold sans-serif''';
        headerFont: '14px bold sans-serif','';
        contentFont: '14px sans-serif','';
        titleColor: '#212529','';
        headerColor: '#007BFF','';
        contentColor: '#495057','';
        questionColor: '#DC3545','
        }'
        answerColor: '#28A745' })
    })
    private isInitialized: boolean = false;
    );
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
    }
    }
        this.state = state; }
    }
    
    /**
     * 初期化
     */
    initialize(): void { this.applyAccessibilitySettings();
        this.isInitialized = true; }
    }
    
    /**
     * アクセシビリティ設定を適用
     */
    private applyAccessibilitySettings(): void {
        const settings = this.state.accessibilitySettings || {};'
        '';
        if(settings.largeText') {'
            '';
            this.textSettings.titleFont = '22px bold sans-serif';''
            this.textSettings.headerFont = '18px bold sans-serif';'
        }'
            this.textSettings.contentFont = '16px sans-serif'; }
        }'
        '';
        if(settings.highContrast') {'
            '';
            this.textSettings.titleColor = '#000000';''
            this.textSettings.headerColor = '#000000';''
            this.textSettings.contentColor = '#000000';''
            this.textSettings.questionColor = '#000000';'
        }'
            this.textSettings.answerColor = '#000000'; }
        }
    }
    
    /**
     * クリーンアップ'
     */''
    cleanup(');