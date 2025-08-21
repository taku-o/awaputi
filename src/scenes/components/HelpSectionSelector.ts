import { GameEngine  } from '../../core/GameEngine';''
import { ComponentEventBus  } from './ComponentEventBus';''
import { SceneState  } from './SceneState';

interface SectionChangeData { oldSection: string,
    newSection: string;
   , buttonIndex: number ,}

/**
 * ヘルプセクション選択コンポーネント
 * ヘルプのセクション切り替えUI
 */
export class HelpSectionSelector {
    private gameEngine: GameEngine;
    private eventBus: ComponentEventBus;
    private state: SceneState;
    ';
    // セクション設定
    private readonly, sections: string[] = ['overview', 'categories', 'progress', 'rewards', 'tips', 'faq'];''
    private readonly sectionLabels: string[] = ['概要', 'カテゴリ', '進捗', '報酬', 'ヒント', 'FAQ'];''
    private currentSection: string = 'overview';
    // UI設定
    private readonly, buttonHeight: number = 40,
    private readonly buttonSpacing: number = 10,
    private readonly cornerRadius: number = 4,
    
    // アニメーション設定
    private readonly animationDuration: number = 200,
    private animationStartTime: number = 0;
    private animatingSection: string | null = null;
    // ホバー状態
    private hoveredButton: number = -1;
    private focusedButton: number = 0;
    // アクセシビリティ設定
    private, accessibilitySettings: any;
    constructor(gameEngine: GameEngine, eventBus: ComponentEventBus, state: SceneState) {
    
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.state = state;
        
    
    ,}
        // アクセシビリティ設定 }
        this.accessibilitySettings = state.accessibilitySettings || {}
    
    /**
     * レンダリング処理
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @returns 描画した高さ
     */
    render(context: CanvasRenderingContext2D, x: number, y: number, width: number): number { const buttonCount = this.sections.length;
        const totalSpacing = (buttonCount - 1) * this.buttonSpacing;
        const buttonWidth = Math.max(80, (width - totalSpacing) / buttonCount);
        
        // 背景を描画
        this.renderBackground(context, x, y, width, this.buttonHeight + 20);
        
        // ボタンを描画
        for(let, i = 0; i < this.sections.length; i++) {
            const buttonX = x + i * (buttonWidth + this.buttonSpacing);
            const buttonY = y + 10;
            
            this.renderSectionButton(;
                context,
                buttonX,
                buttonY,
                buttonWidth,
                this.buttonHeight);
                this.sections[i]);
                this.sectionLabels[i],);
        }
                i); }
        }
        
        return this.buttonHeight + 20;
    }
    
    /**
     * 背景を描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     */''
    private renderBackground(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { ''
        context.fillStyle = this.accessibilitySettings.highContrast ? '#FFFFFF' : '#F8F9FA';''
        context.fillRect(x, y, width, height);
        ';
        // 下部の境界線
        context.strokeStyle = this.accessibilitySettings.highContrast ? '#000000' : '#DEE2E6';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, y + height - 1);
        context.lineTo(x + width, y + height - 1);
        context.stroke(); }
    
    /**
     * セクションボタンを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param section - セクションID
     * @param label - セクションラベル
     * @param index - ボタンインデックス
     */
    private renderSectionButton(;
        context: CanvasRenderingContext2D;
       , x: number, ;
        y: number, ;
        width: number, ;
        height: number, ;
        section: string );
        label: string);
       , index: number;
    ): void { const isActive = this.currentSection === section,
        const isHovered = this.hoveredButton === index;
        const isFocused = this.focusedButton === index;
        const isAnimating = this.animatingSection === section;
        
        // アニメーション効果の計算
        let animationProgress = 1;
        if(isAnimating && this.animationStartTime > 0) {
            const elapsed = performance.now() - this.animationStartTime;
            animationProgress = Math.min(elapsed / this.animationDuration, 1);
            
            if (animationProgress >= 1) {
                this.animatingSection = null;
        }
                this.animationStartTime = 0; }
}
        
        // ボタンの色を決定
        let backgroundColor: string, textColor: string, borderColor: string,

        if(isActive) {'

            backgroundColor = this.interpolateColor('#E3F2FD', '#1976D2', animationProgress);''
            textColor = '#FFFFFF';

        }

            borderColor = '#1565C0';' }

        } else if(isHovered || isFocused) { ''
            backgroundColor = '#E9ECEF';''
            textColor = '#495057';''
            borderColor = '#ADB5BD'; }

        } else {
            backgroundColor = '#FFFFFF';''
            textColor = '#6C757D';' }

            borderColor = '#DEE2E6'; }
        }
        ';
        // 高コントラストモードの調整
        if(this.accessibilitySettings.highContrast) {'

            backgroundColor = isActive ? '#000000' : '#FFFFFF';''
            textColor = isActive ? '#FFFFFF' : '#000000';

        }

            borderColor = '#000000'; }
        }
        
        // ボタン背景を描画
        context.fillStyle = backgroundColor;
        this.roundRect(context, x, y, width, height, this.cornerRadius);
        context.fill();
        
        // ボタン枠線を描画
        context.strokeStyle = borderColor;
        context.lineWidth = isActive || isFocused ? 2 : 1;
        this.roundRect(context, x, y, width, height, this.cornerRadius);
        context.stroke();
        // フォーカス時の追加視覚効果
        if(isFocused && !isActive) {'

            context.strokeStyle = '#007BFF';
            context.lineWidth = 2;
            context.setLineDash([2, 2]);
            this.roundRect(context, x - 1, y - 1, width + 2, height + 2, this.cornerRadius + 1);

            context.stroke();

        }

            context.setLineDash([]); }
        }
        
        // ボタンテキストを描画
        context.fillStyle = textColor;''
        context.font = this.accessibilitySettings.largeText ? '14px bold sans-serif' : '12px bold sans-serif';''
        context.textAlign = 'center';''
        context.textBaseline = 'middle';
        ';
        // テキストのシャドウ効果（アクティブ時）
        if(isActive && !this.accessibilitySettings.highContrast) {'

            context.shadowColor = 'rgba(0, 0, 0, 0.3)';
            context.shadowBlur = 2;
            context.shadowOffsetX = 1;
        }
            context.shadowOffsetY = 1; }
        }

        context.fillText(label, x + width / 2, y + height / 2);
        ';
        // シャドウをリセット
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        
        // アクティブボタンのインジケーター
        if (isActive) { this.renderActiveIndicator(context, x, y + height - 3, width, 3); }
    }
    
    /**
     * アクティブインジケーターを描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     */
    private renderActiveIndicator(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void { ''
        const gradient = context.createLinearGradient(x, y, x + width, y);''
        gradient.addColorStop(0, '#1976D2'');''
        gradient.addColorStop(0.5, '#2196F3'');''
        gradient.addColorStop(1, '#1976D2);
        
        context.fillStyle = gradient;
        this.roundRect(context, x + 5, y, width - 10, height, height / 2);
        context.fill(); }
    
    /**
     * クリック処理
     * @param x - クリックX座標
     * @param y - クリックY座標
     * @param containerX - コンテナX座標
     * @param containerY - コンテナY座標
     * @param containerWidth - コンテナ幅
     * @returns クリックが処理された場合true
     */
    handleClick(x: number, y: number, containerX: number, containerY: number, containerWidth: number): boolean { const relativeX = x - containerX;
        const relativeY = y - containerY;
        
        // セレクター範囲内かチェック
        const selectorHeight = this.buttonHeight + 20;
        if(relativeY < 10 || relativeY > 10 + this.buttonHeight) {
            
        }
            return false;
        
        // クリックされたボタンを特定
        const buttonIndex = this.getButtonIndex(relativeX, containerWidth);
        if(buttonIndex !== -1) {
            this.selectSection(this.sections[buttonIndex], buttonIndex);
        }
            return true;
        
        return false;
    }
    
    /**
     * ホバー処理
     * @param x - マウスX座標
     * @param y - マウスY座標
     * @param containerX - コンテナX座標
     * @param containerY - コンテナY座標
     * @param containerWidth - コンテナ幅
     */
    handleHover(x: number, y: number, containerX: number, containerY: number, containerWidth: number): void { const relativeX = x - containerX;
        const relativeY = y - containerY;
        
        // セレクター範囲内かチェック
        if(relativeY >= 10 && relativeY <= 10 + this.buttonHeight) {
            
        }
            this.hoveredButton = this.getButtonIndex(relativeX, containerWidth); }
        } else { this.hoveredButton = -1; }
    }
    
    /**
     * キーボード処理
     * @param event - キーボードイベント
     * @returns イベントが処理された場合true
     */
    handleKeyboard(event: KeyboardEvent): boolean { ''
        switch(event.key) {'

            case 'ArrowLeft':';
                event.preventDefault();''
                this.focusedButton = Math.max(0, this.focusedButton - 1);
                return true;

            case 'ArrowRight':';
                event.preventDefault();''
                this.focusedButton = Math.min(this.sections.length - 1, this.focusedButton + 1);
                return true;

            case 'Enter':'';
            case ', ':';
                event.preventDefault();''
                this.selectSection(this.sections[this.focusedButton], this.focusedButton);
                return true;

            case 'Home':'';
                event.preventDefault()';
            case 'End':);
                event.preventDefault();
                this.focusedButton = this.sections.length - 1;
        }
                return true;
        
        // 数字キーでのダイレクト選択
        const number = parseInt(event.key);
        if(number >= 1 && number <= this.sections.length) {
            event.preventDefault();
            this.selectSection(this.sections[number - 1], number - 1);
        }
            return true;
        
        return false;
    }
    
    /**
     * ボタンインデックスを取得
     * @param x - 相対X座標
     * @param containerWidth - コンテナ幅
     * @returns ボタンインデックス（-1は該当なし）
     */
    private getButtonIndex(x: number, containerWidth: number): number { const buttonCount = this.sections.length;
        const totalSpacing = (buttonCount - 1) * this.buttonSpacing;
        const buttonWidth = Math.max(80, (containerWidth - totalSpacing) / buttonCount);
        
        for(let, i = 0; i < buttonCount; i++) {
        
            const buttonX = i * (buttonWidth + this.buttonSpacing);
            
            if (x >= buttonX && x <= buttonX + buttonWidth) {
        
        }
                return i;
        
        return -1;
    }
    
    /**
     * セクションを選択
     * @param section - セクションID
     * @param buttonIndex - ボタンインデックス
     */
    private selectSection(section: string, buttonIndex: number): void { if (this.currentSection !== section) {
            const oldSection = this.currentSection;
            this.currentSection = section;
            this.focusedButton = buttonIndex;
            // アニメーション開始
            this.startSectionAnimation(section);
            
            // イベント通知
            const eventData: SectionChangeData = {
                oldSection,
                newSection: section;
                buttonIndex ,};''
            this.eventBus.emit('help-section-changed', eventData);
            
            console.log(`Help, section changed, to: ${section}`});
        }
    }
    
    /**
     * セクション変更アニメーションを開始
     * @param section - アニメーション対象セクション
     */
    private startSectionAnimation(section: string): void { if (!this.accessibilitySettings.reducedMotion) {
            this.animatingSection = section;
            this.animationStartTime = performance.now(); }
    }
    
    /**
     * 色を補間
     * @param color1 - 開始色
     * @param color2 - 終了色
     * @param progress - 進行度（0-1）
     * @returns 補間された色
     */
    private interpolateColor(color1: string, color2: string, progress: number): string { // シンプルな線形補間（実際の実装では色空間を考慮）
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(c1.r + (c2.r - c1.r) * progress);
        const g = Math.round(c1.g + (c2.g - c1.g) * progress);
        const b = Math.round(c1.b + (c2.b - c1.b) * progress);
         }
        return `rgb(${r}, ${g}, ${b}})`;
    }
    
    /**
     * HEX色をRGBに変換
     * @param hex - HEX色文字列
     * @returns RGB値オブジェクト
     */
    private hexToRgb(hex: string): { r: number; g: number;, b: number } | null {
        const result = /^#? ([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { : undefined
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16 } : null;
    }
    
    /**
     * 角丸矩形を描画
     * @param context - Canvas描画コンテキスト
     * @param x - X座標
     * @param y - Y座標
     * @param width - 幅
     * @param height - 高さ
     * @param radius - 角の半径
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
    
    /**
     * 現在のセクションを設定
     * @param section - セクションID
     */
    setCurrentSection(section: string): void { if(this.sections.includes(section) {
            const buttonIndex = this.sections.indexOf(section);
            this.selectSection(section, buttonIndex); }
    }
    
    /**
     * 現在のセクションを取得
     * @returns 現在のセクションID
     */
    getCurrentSection(): string { return this.currentSection; }
    
    /**
     * 利用可能なセクション一覧を取得
     * @returns セクション情報の配列
     */
    getAvailableSections(): Array<{ id: string; label: string;, active: boolean }> { return this.sections.map((section, index) => ({
            id: section;
            label: this.sectionLabels[index]);
           , active: section === this.currentSection ,}
        });
    }
    
    /**
     * クリーンアップ
     */''
    cleanup(');