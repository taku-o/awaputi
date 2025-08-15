/**
 * Help Renderer
 * ヘルプレンダラー - ヘルプシーンの描画処理統合管理
 */

/**
 * Help Renderer
 * ヘルプレンダリング管理器 - UI描画の統合管理
 */
export class HelpRenderer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 基準サイズ（800x600を前提とした設計）
        this.baseWidth = 800;
        this.baseHeight = 600;
        
        // 色設定
        this.colors = {
            background: '#0f0f1a',
            cardBackground: '#1a1a2e',
            primary: '#4a90e2',
            secondary: '#6bb0ff',
            text: '#ffffff',
            textSecondary: '#cccccc',
            border: '#333',
            selected: '#2d5aa0',
            searchBackground: '#16213e',
            buttonBackground: '#2d5aa0',
            buttonHover: '#3d6ab0'
        };

        this.fontSizes = {
            title: 28,
            header: 20,
            normal: 16,
            small: 14,
            tiny: 12
        };
        
        // レイアウトは動的に計算する
        this.calculateLayout();
    }
    
    /**
     * 動的レイアウト計算
     */
    calculateLayout() {
        // キャンバスサイズを取得
        let canvasWidth = this.baseWidth;
        let canvasHeight = this.baseHeight;
        
        if (this.gameEngine && this.gameEngine.canvas) {
            canvasWidth = this.gameEngine.canvas.width;
            canvasHeight = this.gameEngine.canvas.height;
        }
        
        // ResponsiveCanvasManagerのスケール情報も考慮
        let scale = 1;
        if (this.gameEngine && this.gameEngine.responsiveCanvasManager) {
            try {
                const canvasInfo = this.gameEngine.responsiveCanvasManager.getCanvasInfo();
                if (canvasInfo && canvasInfo.scale) {
                    scale = canvasInfo.scale;
                    canvasWidth = canvasInfo.displayWidth || canvasWidth;
                    canvasHeight = canvasInfo.displayHeight || canvasHeight;
                }
            } catch (error) {
                // フォールバック
            }
        }
        
        // マージンを計算（キャンバス幅の比例）
        const margin = 50;
        const spacing = 20;
        
        // サイドバー幅（最大250px、キャンバス幅の30%まで）
        const sidebarWidth = Math.min(250, canvasWidth * 0.3);
        
        // コンテンツ幅（残りスペースから計算、最小300px）
        const availableWidth = canvasWidth - margin - sidebarWidth - spacing - margin;
        const contentWidth = Math.max(300, availableWidth);
        
        // 戻るボタンの高さを考慮してコンテンツ領域を計算
        const backButtonHeight = 40;
        const backButtonMargin = 15; // 戻るボタンの上側マージン
        const backButtonY = canvasHeight - backButtonHeight - 10; // キャンバス下端から10px上
        
        // コンテンツ領域は戻るボタンの上まで伸ばす
        const contentBottom = backButtonY - backButtonMargin;
        const contentHeight = Math.max(300, contentBottom - 110);
        
        // レイアウト設定
        this.layout = {
            sidebar: {
                x: margin,
                y: 110,
                width: sidebarWidth,
                height: contentHeight
            },
            content: {
                x: margin + sidebarWidth + spacing,
                y: 110,
                width: contentWidth,
                height: contentHeight
            },
            searchBar: {
                x: margin,
                y: 60,
                width: Math.min(720, canvasWidth - margin * 2),
                height: 40
            },
            backButton: {
                x: margin,
                y: backButtonY,
                width: 100,
                height: backButtonHeight
            }
        };
    }

    /**
     * メイン描画処理
     */
    render(ctx, state, accessibilityManager, animationManager, transitionRenderer) {
        ctx.save();
        
        // レイアウトを再計算（キャンバスサイズ変更に対応）
        this.calculateLayout();
        
        // 背景クリア
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        try {
            // タイトル描画
            this.renderTitle(ctx);

            // 検索バー描画（HTML input要素を使用するため、Canvas描画は無効化）
            // this.renderSearchBar(ctx, state.searchQuery, accessibilityManager.getCurrentFocusIndex() === 0);

            // サイドバー描画
            this.renderSidebar(ctx, state, accessibilityManager.getCurrentFocusIndex() === 1, animationManager);

            // メインコンテンツ描画
            if (state.isSearching && state.searchResults.length > 0) {
                this.renderSearchResults(ctx, state, accessibilityManager.getCurrentFocusIndex() === 2);
            } else {
                // アニメーション中の場合はtransitionRendererを使用
                if (!transitionRenderer.renderContentTransition(ctx, this.layout.content, this)) {
                    this.renderContent(ctx, state, accessibilityManager.getCurrentFocusIndex() === 3);
                }
            }

            // 戻るボタン描画
            this.renderBackButton(ctx, accessibilityManager.getCurrentFocusIndex() === 4);

            // アクセシビリティ要素の描画
            this.renderAccessibilityElements(ctx, accessibilityManager);

        } catch (error) {
            console.error('Render error in HelpRenderer:', error);
            this.renderErrorMessage(ctx, 'レンダリングエラーが発生しました');
        }

        ctx.restore();
    }

    /**
     * タイトル描画
     */
    renderTitle(ctx) {
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.fontSizes.title}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const title = t('help.title', 'ヘルプ');
        
        // Transform行列のスケールを考慮した中央位置
        const transform = ctx.getTransform();
        const centerX = (ctx.canvas.width / 2) / transform.a;
        
        ctx.fillText(title, centerX, 10);
    }

    /**
     * 検索バー描画
     */
    renderSearchBar(ctx, searchQuery, focused) {
        const searchBar = this.layout.searchBar;
        
        // 背景
        ctx.fillStyle = focused ? this.colors.primary : this.colors.searchBackground;
        this.roundRect(ctx, searchBar.x, searchBar.y, searchBar.width, searchBar.height, 8, true);
        
        // 境界線
        ctx.strokeStyle = focused ? this.colors.secondary : this.colors.border;
        ctx.lineWidth = focused ? 2 : 1;
        this.roundRect(ctx, searchBar.x, searchBar.y, searchBar.width, searchBar.height, 8, false);
        
        // フォーカスインジケーター
        if (focused) {
            ctx.strokeStyle = this.colors.secondary;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            this.roundRect(ctx, searchBar.x - 2, searchBar.y - 2, searchBar.width + 4, searchBar.height + 4, 10, false);
            ctx.setLineDash([]);
        }
        
        // プレースホルダーまたは検索テキスト
        ctx.fillStyle = this.colors.text;
        ctx.font = `${this.fontSizes.normal}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const displayText = searchQuery || 'ヘルプを検索... (/)';
        const textColor = searchQuery ? this.colors.text : this.colors.textSecondary;
        
        ctx.fillStyle = textColor;
        const textX = searchBar.x + 15;
        const textY = searchBar.y + searchBar.height / 2;
        ctx.fillText(displayText, textX, textY);
        
        // フォーカス時のカーソル描画
        if (focused && searchQuery) {
            const textWidth = ctx.measureText(searchQuery).width;
            const cursorX = textX + textWidth + 2;
            
            // 点滅カーソル（簡易実装）
            ctx.strokeStyle = this.colors.text;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cursorX, textY - 8);
            ctx.lineTo(cursorX, textY + 8);
            ctx.stroke();
        }
        
        // 検索アイコン
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `${this.fontSizes.normal}px Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText('🔍', searchBar.x + searchBar.width - 15, searchBar.y + searchBar.height / 2);
    }

    /**
     * サイドバー描画
     */
    renderSidebar(ctx, state, focused, animationManager) {
        const sidebar = this.layout.sidebar;
        
        // サイドバー背景
        ctx.fillStyle = this.colors.cardBackground;
        this.roundRect(ctx, sidebar.x, sidebar.y, sidebar.width, sidebar.height, 8, true);
        
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        this.roundRect(ctx, sidebar.x, sidebar.y, sidebar.width, sidebar.height, 8, false);
        
        // フォーカスインジケーター
        if (focused) {
            ctx.strokeStyle = this.colors.secondary;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            this.roundRect(ctx, sidebar.x - 2, sidebar.y - 2, sidebar.width + 4, sidebar.height + 4, 10, false);
            ctx.setLineDash([]);
        }

        // カテゴリ遷移アニメーション処理
        const hasCategoryTransition = animationManager && 
            animationManager.getAnimationState('categoryTransition')?.isActive;

        let currentY = sidebar.y + 10;
        
        // カテゴリリスト描画
        for (let catIndex = 0; catIndex < state.categories.length; catIndex++) {
            const category = state.categories[catIndex];
            const isSelected = category.id === state.selectedCategory;
            
            // アニメーション中のカテゴリ特別処理
            let alpha = 1;
            let offsetX = 0;
            
            if (hasCategoryTransition) {
                const transition = animationManager.getAnimationState('categoryTransition');
                const fromIndex = transition.fromIndex;
                const toIndex = transition.toIndex;
                const progress = animationManager.applyEasing(transition.progress, 'easeOut');
                
                if (catIndex === fromIndex) {
                    alpha = 1 - progress;
                    offsetX = -10 * progress;
                } else if (catIndex === toIndex) {
                    alpha = progress;
                    offsetX = 10 * (1 - progress);
                }
            }
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // カテゴリ項目の背景
            if (isSelected) {
                ctx.fillStyle = this.colors.selected;
                this.roundRect(ctx, sidebar.x + 5 + offsetX, currentY - 2, sidebar.width - 10, 35, 4, true);
            }
            
            // カテゴリ名
            ctx.fillStyle = isSelected ? this.colors.text : this.colors.textSecondary;
            ctx.font = `${isSelected ? 'bold ' : ''}${this.fontSizes.normal}px Arial, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const categoryName = this.gameEngine.localizationManager.t(category.key, category.id);
            ctx.fillText(categoryName, sidebar.x + 15 + offsetX, currentY + 15);
            
            currentY += 40;
            
            // 選択されたカテゴリのトピック一覧
            if (isSelected && category.topics.length > 0) {
                for (let i = 0; i < category.topics.length; i++) {
                    const topic = category.topics[i];
                    const isTopicSelected = i === state.selectedTopicIndex;
                    
                    // トピック項目の背景
                    if (isTopicSelected) {
                        ctx.fillStyle = this.colors.primary;
                        this.roundRect(ctx, sidebar.x + 15 + offsetX, currentY - 2, sidebar.width - 30, 25, 4, true);
                    }
                    
                    // トピック名
                    ctx.fillStyle = isTopicSelected ? this.colors.text : this.colors.textSecondary;
                    ctx.font = `${this.fontSizes.small}px Arial, sans-serif`;
                    ctx.fillText(`  • ${topic.title}`, sidebar.x + 25 + offsetX, currentY + 10);
                    
                    currentY += 30;
                    
                    if (currentY > sidebar.y + sidebar.height - 30) {
                        break; // スペース不足
                    }
                }
            }
            
            ctx.restore();
        }
    }

    /**
     * メインコンテンツ描画
     */
    renderContent(ctx, state, focused) {
        const contentArea = this.layout.content;
        
        // コンテンツエリア背景
        ctx.fillStyle = this.colors.cardBackground;
        this.roundRect(ctx, contentArea.x, contentArea.y, contentArea.width, contentArea.height, 8, true);
        
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        this.roundRect(ctx, contentArea.x, contentArea.y, contentArea.width, contentArea.height, 8, false);
        
        // フォーカスインジケーター
        if (focused) {
            ctx.strokeStyle = this.colors.secondary;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            this.roundRect(ctx, contentArea.x - 2, contentArea.y - 2, contentArea.width + 4, contentArea.height + 4, 10, false);
            ctx.setLineDash([]);
        }
        
        // コンテンツ描画
        if (state.currentContent) {
            this.renderContentData(ctx, contentArea, state.currentContent);
        } else {
            this.renderNoContentMessage(ctx, contentArea);
        }
    }

    /**
     * コンテンツデータ描画
     */
    renderContentData(ctx, contentArea, contentData) {
        let currentY = contentArea.y + 20;
        const maxWidth = contentArea.width - 40;
        
        // タイトル
        if (contentData.title) {
            ctx.fillStyle = this.colors.text;
            ctx.font = `bold ${this.fontSizes.header}px Arial, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const titleLines = this.wrapText(ctx, contentData.title, maxWidth);
            titleLines.forEach(line => {
                ctx.fillText(line, contentArea.x + 20, currentY);
                currentY += this.fontSizes.header + 5;
            });
            currentY += 10;
        }
        
        // 説明
        if (contentData.description) {
            ctx.fillStyle = this.colors.textSecondary;
            ctx.font = `${this.fontSizes.normal}px Arial, sans-serif`;
            
            const descLines = this.wrapText(ctx, contentData.description, maxWidth);
            descLines.forEach(line => {
                ctx.fillText(line, contentArea.x + 20, currentY);
                currentY += this.fontSizes.normal + 3;
            });
            currentY += 15;
        }
        
        // ステップまたは詳細情報
        if (contentData.steps && contentData.steps.length > 0) {
            for (let i = 0; i < contentData.steps.length; i++) {
                const step = contentData.steps[i];
                
                // ステップ番号
                ctx.fillStyle = this.colors.primary;
                ctx.font = `bold ${this.fontSizes.normal}px Arial, sans-serif`;
                ctx.fillText(`${i + 1}.`, contentArea.x + 20, currentY);
                
                // ステップ内容
                ctx.fillStyle = this.colors.text;
                ctx.font = `${this.fontSizes.normal}px Arial, sans-serif`;
                
                const stepLines = this.wrapText(ctx, step, maxWidth - 30);
                stepLines.forEach((line, lineIndex) => {
                    const xOffset = lineIndex === 0 ? 40 : 20;
                    ctx.fillText(line, contentArea.x + xOffset, currentY);
                    currentY += this.fontSizes.normal + 3;
                });
                
                currentY += 10;
                
                if (currentY > contentArea.y + contentArea.height - 30) {
                    break; // スペース不足
                }
            }
        }
    }

    /**
     * 検索結果描画
     */
    renderSearchResults(ctx, state, focused) {
        const contentArea = this.layout.content;
        
        // 背景
        ctx.fillStyle = this.colors.cardBackground;
        this.roundRect(ctx, contentArea.x, contentArea.y, contentArea.width, contentArea.height, 8, true);
        
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        this.roundRect(ctx, contentArea.x, contentArea.y, contentArea.width, contentArea.height, 8, false);
        
        // フォーカスインジケーター
        if (focused) {
            ctx.strokeStyle = this.colors.secondary;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            this.roundRect(ctx, contentArea.x - 2, contentArea.y - 2, contentArea.width + 4, contentArea.height + 4, 10, false);
            ctx.setLineDash([]);
        }
        
        // 検索結果ヘッダー
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.fontSizes.header}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`検索結果: "${state.searchQuery}"`, contentArea.x + 20, contentArea.y + 20);
        
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `${this.fontSizes.small}px Arial, sans-serif`;
        ctx.fillText(`${state.searchResults.length}件見つかりました`, contentArea.x + 20, contentArea.y + 50);
        
        // 検索結果リスト
        let currentY = contentArea.y + 80;
        const itemHeight = 40;
        
        for (let i = 0; i < Math.min(state.searchResults.length, 8); i++) {
            const result = state.searchResults[i];
            const isSelected = i === state.selectedTopicIndex;
            
            // 結果項目の背景
            if (isSelected) {
                ctx.fillStyle = this.colors.selected;
                this.roundRect(ctx, contentArea.x + 10, currentY - 5, contentArea.width - 20, itemHeight, 4, true);
            }
            
            // SearchEngineの結果構造に対応
            const resultData = result.content || result;
            const title = resultData.title || result.title || 'Untitled';
            const categoryName = resultData.categoryName || result.categoryName || resultData.category || 'Unknown';
            
            // 結果タイトル
            ctx.fillStyle = isSelected ? this.colors.text : this.colors.textSecondary;
            ctx.font = `${isSelected ? 'bold ' : ''}${this.fontSizes.normal}px Arial, sans-serif`;
            ctx.fillText(title, contentArea.x + 20, currentY + 5);
            
            // カテゴリ情報
            ctx.fillStyle = this.colors.textSecondary;
            ctx.font = `${this.fontSizes.small}px Arial, sans-serif`;
            ctx.fillText(`カテゴリ: ${categoryName}`, contentArea.x + 20, currentY + 25);
            
            currentY += itemHeight + 5;
            
            if (currentY > contentArea.y + contentArea.height - 40) {
                break;
            }
        }
    }

    /**
     * 戻るボタン描画
     */
    renderBackButton(ctx, focused) {
        const backButton = this.layout.backButton;
        
        // ボタン背景
        ctx.fillStyle = focused ? this.colors.buttonHover : this.colors.buttonBackground;
        this.roundRect(ctx, backButton.x, backButton.y, backButton.width, backButton.height, 6, true);
        
        // ボタン境界線
        ctx.strokeStyle = focused ? this.colors.secondary : this.colors.border;
        ctx.lineWidth = focused ? 2 : 1;
        this.roundRect(ctx, backButton.x, backButton.y, backButton.width, backButton.height, 6, false);
        
        // フォーカスインジケーター
        if (focused) {
            ctx.strokeStyle = this.colors.secondary;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            this.roundRect(ctx, backButton.x - 2, backButton.y - 2, backButton.width + 4, backButton.height + 4, 8, false);
            ctx.setLineDash([]);
        }
        
        // ボタンテキスト
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.fontSizes.normal}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const t = this.gameEngine.localizationManager.t.bind(this.gameEngine.localizationManager);
        const backText = t('common.back', '戻る');
        
        ctx.fillText(backText, backButton.x + backButton.width / 2, backButton.y + backButton.height / 2);
    }

    /**
     * コンテンツなしメッセージ
     */
    renderNoContentMessage(ctx, contentArea) {
        ctx.fillStyle = this.colors.textSecondary;
        ctx.font = `${this.fontSizes.normal}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(
            'カテゴリとトピックを選択してください',
            contentArea.x + contentArea.width / 2,
            contentArea.y + contentArea.height / 2
        );
    }

    /**
     * エラーメッセージ描画
     */
    renderErrorMessage(ctx, message) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.fontSizes.header}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Transform行列のスケールを考慮した中央位置
        const transform = ctx.getTransform();
        const centerX = (ctx.canvas.width / 2) / transform.a;
        const centerY = (ctx.canvas.height / 2) / transform.d;
        
        ctx.fillText(message, centerX, centerY);
    }

    /**
     * アクセシビリティ要素描画
     */
    renderAccessibilityElements(ctx, accessibilityManager) {
        if (!accessibilityManager.screenReaderMode) return;
        
        // 現在のフォーカス要素の追加情報表示
        const focusIndex = accessibilityManager.getCurrentFocusIndex();
        const elements = accessibilityManager.getFocusableElements();
        
        if (focusIndex >= 0 && focusIndex < elements.length) {
            const element = elements[focusIndex];
            const ariaInfo = accessibilityManager.getAriaLabel(element.id);
            
            if (ariaInfo) {
                // アクセシビリティ情報のオーバーレイ
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(10, ctx.canvas.height - 60, 400, 50);
                
                ctx.fillStyle = this.colors.text;
                ctx.font = `${this.fontSizes.small}px Arial, sans-serif`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                
                ctx.fillText(ariaInfo.label, 15, ctx.canvas.height - 55);
                ctx.fillText(ariaInfo.description, 15, ctx.canvas.height - 35);
            }
        }
    }

    /**
     * テキストの自動改行（日本語対応）
     */
    wrapText(ctx, text, maxWidth) {
        if (!text) return [];
        
        const lines = [];
        let currentLine = '';
        
        // 日本語対応: 文字単位で処理
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
                
                // 句読点や改行で自然に改行
                if (char === '。' || char === '、' || char === '\n') {
                    const nextChar = text[i + 1];
                    if (nextChar && ctx.measureText(currentLine + nextChar).width > maxWidth) {
                        lines.push(currentLine);
                        currentLine = '';
                    }
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    /**
     * 角丸矩形描画
     */
    roundRect(ctx, x, y, width, height, radius, fill = true) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        if (fill) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    /**
     * レイアウト取得
     */
    getLayout() {
        return { ...this.layout };
    }

    /**
     * 設定更新
     */
    updateColors(newColors) {
        Object.assign(this.colors, newColors);
    }

    updateLayout(newLayout) {
        Object.assign(this.layout, newLayout);
    }

    /**
     * 点が矩形内にあるかチェック
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
}