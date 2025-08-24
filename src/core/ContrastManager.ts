/**
 * コントラスト管理クラス
 * アクセシビリティのためのコントラスト調整機能を提供
 */

import { getErrorHandler } from '../utils/ErrorHandler';

export interface ContrastConfig {
    enabled: boolean;
    level: 'normal' | 'high' | 'maximum';
    customRatio: number;
    autoAdjust: boolean;
    preserveColors: boolean;
}

export interface ColorInfo {
    hex: string;
    rgb: { r: number; g: number; b: number; };
    luminance: number;
}

export class ContrastManager {
    private config: ContrastConfig;
    private originalStyles: Map<HTMLElement, string> = new Map();
    private contrastRatios = {
        normal: 4.5,
        high: 7.0,
        maximum: 21.0
    };
    private errorHandler: any;
    private systemContrastQuery: MediaQueryList | null = null;

    constructor(config: Partial<ContrastConfig> = {}) {
        this.config = {
            enabled: false,
            level: 'normal',
            customRatio: 4.5,
            autoAdjust: false,
            preserveColors: false,
            ...config
        };

        // エラーハンドラを取得
        try {
            this.errorHandler = getErrorHandler();
        } catch (error) {
            console.warn('[ContrastManager] ErrorHandler not available:', error);
        }

        this.initialize();
    }

    private initialize(): void {
        this.loadUserPreferences();
        this.setupEventListeners();
        
        if (this.config.enabled) {
            this.applyContrastAdjustments();
        }
        
        console.log('[ContrastManager] initialized');
    }

    private loadUserPreferences(): void {
        try {
            const saved = localStorage.getItem('contrastManager_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                this.config = { ...this.config, ...preferences };
            }
        } catch (error) {
            console.warn('[ContrastManager] Failed to load contrast preferences:', error);
        }
    }

    private saveUserPreferences(): void {
        try {
            localStorage.setItem('contrastManager_preferences', JSON.stringify(this.config));
        } catch (error) {
            console.warn('[ContrastManager] Failed to save contrast preferences:', error);
        }
    }

    private setupEventListeners(): void {
        // システムのハイコントラストモード検出
        if (window.matchMedia) {
            try {
                this.systemContrastQuery = window.matchMedia('(prefers-contrast: high)');
                this.systemContrastQuery.addEventListener('change', this.handleSystemContrastChange.bind(this));
                
                if (this.systemContrastQuery.matches && this.config.autoAdjust) {
                    this.enable('high');
                }
            } catch (error) {
                this.handleError('setupEventListeners', error);
            }
        }
    }

    private handleSystemContrastChange(event: MediaQueryListEvent): void {
        if (this.config.autoAdjust) {
            if (event.matches) {
                this.enable('high');
            } else {
                this.disable();
            }
        }
    }

    /**
     * コントラスト強化を有効化
     */
    enable(level: ContrastConfig['level'] = 'normal'): void {
        try {
            this.config.enabled = true;
            this.config.level = level;
            this.applyContrastAdjustments();
            this.saveUserPreferences();
            console.log(`[ContrastManager] Contrast enhancement enabled: ${level}`);
        } catch (error) {
            this.handleError('enable', error, { level });
        }
    }

    /**
     * コントラスト強化を無効化
     */
    disable(): void {
        try {
            this.config.enabled = false;
            this.removeContrastAdjustments();
            this.saveUserPreferences();
            console.log('[ContrastManager] Contrast enhancement disabled');
        } catch (error) {
            this.handleError('disable', error);
        }
    }

    private applyContrastAdjustments(): void {
        try {
            const elements = document.querySelectorAll('*');
            const targetRatio = this.contrastRatios[this.config.level] || this.config.customRatio;

            elements.forEach(element => {
                const htmlElement = element as HTMLElement;
                this.adjustElementContrast(htmlElement, targetRatio);
            });

            // 全体的なCSSフィルターの適用
            this.applyGlobalContrastFilter();
        } catch (error) {
            this.handleError('applyContrastAdjustments', error);
        }
    }

    private adjustElementContrast(element: HTMLElement, targetRatio: number): void {
        try {
            const computedStyle = window.getComputedStyle(element);
            const backgroundColor = computedStyle.backgroundColor;
            const color = computedStyle.color;

            if (backgroundColor && color && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const bgColor = this.parseColor(backgroundColor);
                const textColor = this.parseColor(color);
                
                if (bgColor && textColor) {
                    const currentRatio = this.calculateContrastRatio(bgColor, textColor);
                    
                    if (currentRatio < targetRatio) {
                        const adjustedColors = this.adjustColors(bgColor, textColor, targetRatio);
                        
                        if (!this.originalStyles.has(element)) {
                            this.originalStyles.set(element, `
                                background-color: ${backgroundColor};
                                color: ${color};
                            `);
                        }

                        element.style.backgroundColor = this.rgbToHex(adjustedColors.background);
                        element.style.color = this.rgbToHex(adjustedColors.text);
                    }
                }
            }
        } catch (error) {
            this.handleError('adjustElementContrast', error, { element, targetRatio });
        }
    }

    private applyGlobalContrastFilter(): void {
        try {
            const existingFilter = document.getElementById('contrast-filter');
            if (existingFilter) {
                existingFilter.remove();
            }

            const filterValue = this.getContrastFilterValue();
            if (filterValue > 1) {
                const style = document.createElement('style');
                style.id = 'contrast-filter';
                style.textContent = `
                    body {
                        filter: contrast(${filterValue}) !important;
                    }
                `;
                document.head.appendChild(style);
            }
        } catch (error) {
            this.handleError('applyGlobalContrastFilter', error);
        }
    }

    private getContrastFilterValue(): number {
        switch (this.config.level) {
            case 'high':
                return 1.5;
            case 'maximum':
                return 2.0;
            default:
                return 1.0;
        }
    }

    private removeContrastAdjustments(): void {
        try {
            // 元のスタイルを復元
            this.originalStyles.forEach((originalStyle, element) => {
                const styles = this.parseStyleString(originalStyle);
                Object.entries(styles).forEach(([property, value]) => {
                    element.style.setProperty(property, value as string);
                });
            });
            
            this.originalStyles.clear();

            // グローバルフィルターの削除
            const existingFilter = document.getElementById('contrast-filter');
            if (existingFilter) {
                existingFilter.remove();
            }
        } catch (error) {
            this.handleError('removeContrastAdjustments', error);
        }
    }

    private parseStyleString(styleString: string): Record<string, string> {
        const styles: Record<string, string> = {};
        const declarations = styleString.split(';');

        declarations.forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
                styles[property] = value;
            }
        });

        return styles;
    }

    private parseColor(colorString: string): ColorInfo | null {
        try {
            // RGB/RGBA解析
            const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                
                const rgb = { r, g, b };
                return {
                    hex: this.rgbToHex(rgb),
                    rgb,
                    luminance: this.calculateLuminance(rgb)
                };
            }

            // HEX解析
            const hexMatch = colorString.match(/^#([a-f\d]{6})$/i);
            if (hexMatch) {
                const hex = hexMatch[1];
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                
                const rgb = { r, g, b };
                return {
                    hex: colorString,
                    rgb,
                    luminance: this.calculateLuminance(rgb)
                };
            }

            return null;
        } catch (error) {
            this.handleError('parseColor', error, { colorString });
            return null;
        }
    }

    private calculateLuminance(rgb: { r: number; g: number; b: number; }): number {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    private calculateContrastRatio(color1: ColorInfo, color2: ColorInfo): number {
        const l1 = Math.max(color1.luminance, color2.luminance);
        const l2 = Math.min(color1.luminance, color2.luminance);
        return (l1 + 0.05) / (l2 + 0.05);
    }

    private adjustColors(
        bgColor: ColorInfo,
        textColor: ColorInfo,
        targetRatio: number
    ): { background: { r: number; g: number; b: number; }; text: { r: number; g: number; b: number; }; } {
        try {
            // 簡略版の色調整
            if (bgColor.luminance > textColor.luminance) {
                // 背景が明るい場合、テキストを暗くする
                const darkLevel = Math.max(0, Math.min(255, 255 - (targetRatio * 50)));
                return {
                    background: bgColor.rgb,
                    text: { r: darkLevel, g: darkLevel, b: darkLevel }
                };
            } else {
                // 背景が暗い場合、テキストを明るくする
                const lightLevel = Math.max(0, Math.min(255, targetRatio * 50));
                return {
                    background: bgColor.rgb,
                    text: { r: lightLevel, g: lightLevel, b: lightLevel }
                };
            }
        } catch (error) {
            this.handleError('adjustColors', error, { bgColor, textColor, targetRatio });
            // フォールバック: 基本的な白黒コントラスト
            if (bgColor.luminance > textColor.luminance) {
                return {
                    background: bgColor.rgb,
                    text: { r: 0, g: 0, b: 0 }
                };
            } else {
                return {
                    background: bgColor.rgb,
                    text: { r: 255, g: 255, b: 255 }
                };
            }
        }
    }

    private rgbToHex(rgb: { r: number; g: number; b: number; }): string {
        return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
    }

    /**
     * 2つの色のコントラスト比を計算
     */
    getContrastRatio(color1: string, color2: string): number {
        try {
            const c1 = this.parseColor(color1);
            const c2 = this.parseColor(color2);
            
            if (c1 && c2) {
                return this.calculateContrastRatio(c1, c2);
            }
            
            return 1;
        } catch (error) {
            this.handleError('getContrastRatio', error, { color1, color2 });
            return 1;
        }
    }

    /**
     * 色がWCAGアクセシビリティ基準を満たすかチェック
     */
    isAccessible(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
        const ratio = this.getContrastRatio(color1, color2);
        const minRatio = level === 'AAA' ? 7.0 : 4.5;
        return ratio >= minRatio;
    }

    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<ContrastConfig>): void {
        try {
            this.config = { ...this.config, ...newConfig };
            
            if (this.config.enabled) {
                this.applyContrastAdjustments();
            } else {
                this.removeContrastAdjustments();
            }
            
            this.saveUserPreferences();
        } catch (error) {
            this.handleError('updateConfig', error, { newConfig });
        }
    }

    /**
     * 設定を取得
     */
    getConfig(): ContrastConfig {
        return { ...this.config };
    }

    /**
     * 有効状態を取得
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * 現在のレベルを取得
     */
    getCurrentLevel(): ContrastConfig['level'] {
        return this.config.level;
    }

    /**
     * 利用可能なレベルを取得
     */
    getAvailableLevels(): ContrastConfig['level'][] {
        return ['normal', 'high', 'maximum'];
    }

    /**
     * システムがハイコントラストモードかチェック
     */
    isSystemHighContrast(): boolean {
        return this.systemContrastQuery ? this.systemContrastQuery.matches : false;
    }

    /**
     * エラーハンドリング
     */
    private handleError(operation: string, error: any, context?: any): void {
        if (this.errorHandler && this.errorHandler.handleError) {
            this.errorHandler.handleError(error, {
                context: 'ContrastManager',
                operation,
                ...context
            });
        } else {
            console.error(`[ContrastManager] Error in ${operation}:`, error, context);
        }
    }

    /**
     * 破棄処理
     */
    destroy(): void {
        try {
            this.disable();
            
            if (this.systemContrastQuery) {
                this.systemContrastQuery.removeEventListener('change', this.handleSystemContrastChange.bind(this));
                this.systemContrastQuery = null;
            }

            this.originalStyles.clear();
            
            console.log('[ContrastManager] destroyed');
        } catch (error) {
            this.handleError('destroy', error);
        }
    }
}

// シングルトンインスタンス
let instance: ContrastManager | null = null;

/**
 * シングルトンインスタンスを取得
 */
export function getContrastManager(config?: Partial<ContrastConfig>): ContrastManager {
    if (!instance) {
        instance = new ContrastManager(config);
    }
    return instance;
}

/**
 * シングルトンインスタンスをリセット（主にテスト用）
 */
export function resetContrastManager(): void {
    if (instance) {
        instance.destroy();
        instance = null;
    }
}