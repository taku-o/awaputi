/**
 * AccessibilityProfileIntegrationExample.ts
 * 
 * AccessibilityProfileComponentをSettingsSceneに統合する方法の例
 * 
 * @version 1.0.0
 * @since Issue #170 - Task 1.2: AccessibilityProfileComponent Integration Example
 */

import { AccessibilityProfileComponent } from '../AccessibilityProfileComponent.js';

interface GameEngine {
    renderer?: {
        canvas?: HTMLCanvasElement;
    };
    settingsManager?: {
        set: (key: string, value: any) => void;
    };
    sceneManager?: {
        currentScene?: {
            requestRedraw?: () => void;
        };
    };
    emit?: (event: string, data: any) => void;
}

interface SettingItem {
    key: string;
    label: string;
    type: string;
    component?: string;
    description?: string;
    category?: string;
}

interface ProfileInfo {
    name: string;
    description: string;
}

interface Profile {
    name: string;
    description: string;
    settings: {
        [key: string]: boolean;
    };
}

interface ProfileChangeDetail {
    profileId: string;
    timestamp: number;
}

/**
 * SettingsSceneでAccessibilityProfileComponentを統合する例
 */
export class AccessibilityProfileIntegrationExample {
    private gameEngine: GameEngine;
    private accessibilityProfileComponent: AccessibilityProfileComponent | null;

    constructor(gameEngine: GameEngine) {
        this.gameEngine = gameEngine;
        this.accessibilityProfileComponent = null;
    }
    
    /**
     * SettingsSceneのinitializeSettingItems()メソッドに追加する設定項目の例
     */
    getAccessibilityProfileSettingItem(): SettingItem {
        return {
            key: 'accessibility.profile',
            label: 'アクセシビリティプロファイル',
            type: 'custom', // カスタムコンポーネントとして実装
            component: 'AccessibilityProfileComponent',
            description: 'プリセットされたアクセシビリティ設定を選択できます',
            category: 'accessibility'
        };
    }
    
    /**
     * SettingsSceneのrenderSettings()メソッドに統合する例
     */
    renderAccessibilityProfile(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        try {
            // カスタムコンポーネントの場合はCanvasベースの描画をスキップ
            // DOM要素として別途表示される
            
            // プロファイル情報の表示（Canvas上）
            const profile = this.getCurrentProfileInfo();
            
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`現在のプロファイル: ${profile.name}`, x, y + 20);
            ctx.fillText(profile.description, x, y + 40);
            ctx.restore();
            
            // DOM要素のポジション調整
            this.positionAccessibilityProfileComponent(x, y + 50, width, height - 50);
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Render error:', error);
        }
    }
    
    /**
     * SettingsSceneのhandleCustomComponent()メソッドに追加する例
     */
    handleAccessibilityProfileComponent(settingItem: SettingItem, parentElement: HTMLElement): HTMLElement | null {
        try {
            // AccessibilityProfileComponentを初期化
            if (!this.accessibilityProfileComponent) {
                this.accessibilityProfileComponent = new AccessibilityProfileComponent(this.gameEngine);
            }
            
            // コンポーネントを親要素に追加
            const componentElement = this.accessibilityProfileComponent.initialize(parentElement);
            
            if (componentElement) {
                // プロファイル変更イベントのリスナーを設定
                componentElement.addEventListener('accessibilityProfileChanged', (event) => {
                    const customEvent = event as CustomEvent<ProfileChangeDetail>;
                    this.handleProfileChanged(customEvent.detail);
                });
            }
            
            return componentElement;
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Component creation error:', error);
            return null;
        }
    }
    
    /**
     * プロファイル変更時の処理
     */
    handleProfileChanged(detail: ProfileChangeDetail): void {
        try {
            console.log('[AccessibilityProfileIntegration] Profile changed:', detail);
            
            // SettingsSceneの他の設定項目を更新
            this.updateRelatedAccessibilitySettings(detail.profileId);
            
            // UI全体に変更を反映
            this.notifyAccessibilityChanged();
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Profile change handling error:', error);
        }
    }
    
    /**
     * 関連するアクセシビリティ設定の更新
     */
    updateRelatedAccessibilitySettings(profileId: string): void {
        try {
            // プロファイル情報を取得
            const profile = this.getProfileById(profileId);
            if (!profile) return;
            
            // SettingsSceneの対応する設定項目を更新
            const settingsToUpdate = [
                'accessibility.highContrast',
                'accessibility.reducedMotion',
                'accessibility.largeText',
                'accessibility.screenReader',
                'accessibility.colorBlindSupport'
            ];
            
            settingsToUpdate.forEach(settingKey => {
                if (profile.settings.hasOwnProperty(settingKey)) {
                    // SettingsSceneの設定値を更新
                    this.updateSettingValue(settingKey, profile.settings[settingKey]);
                }
            });
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Settings update error:', error);
        }
    }
    
    /**
     * 現在のプロファイル情報を取得
     */
    getCurrentProfileInfo(): ProfileInfo {
        if (this.accessibilityProfileComponent) {
            const currentProfileId = this.accessibilityProfileComponent.getCurrentProfile();
            const profile = this.getProfileById(currentProfileId);
            return profile ? { name: profile.name, description: profile.description } : { name: 'デフォルト', description: '標準設定' };
        }
        return { name: 'デフォルト', description: '標準設定' };
    }
    
    /**
     * プロファイルIDからプロファイル情報を取得
     */
    getProfileById(profileId: string): Profile | undefined {
        const profiles: Record<string, Profile> = {
            'default': {
                name: 'デフォルト',
                description: '標準設定',
                settings: {
                    'accessibility.highContrast': false,
                    'accessibility.reducedMotion': false,
                    'accessibility.largeText': false,
                    'accessibility.screenReader': false,
                    'accessibility.colorBlindSupport': false
                }
            },
            'highContrast': {
                name: 'ハイコントラスト',
                description: '見やすい高コントラスト表示',
                settings: {
                    'accessibility.highContrast': true,
                    'accessibility.reducedMotion': false,
                    'accessibility.largeText': true,
                    'accessibility.screenReader': true,
                    'accessibility.colorBlindSupport': true
                }
            },
            'motorAccessibility': {
                name: 'モビリティ対応',
                description: 'モーション削減とナビゲーション支援',
                settings: {
                    'accessibility.highContrast': false,
                    'accessibility.reducedMotion': true,
                    'accessibility.largeText': true,
                    'accessibility.screenReader': false,
                    'accessibility.colorBlindSupport': false
                }
            }
        };
        
        return profiles[profileId];
    }
    
    /**
     * DOM要素の位置調整
     */
    positionAccessibilityProfileComponent(x: number, y: number, width: number, height: number): void {
        try {
            if (!this.accessibilityProfileComponent || !this.accessibilityProfileComponent.container) {
                return;
            }
            
            const container = this.accessibilityProfileComponent.container;
            
            // Canvas座標からCSS座標に変換
            const canvasElement = this.gameEngine.renderer?.canvas;
            if (!canvasElement) return;
            
            const canvasRect = canvasElement.getBoundingClientRect();
            const scaleX = canvasRect.width / canvasElement.width;
            const scaleY = canvasRect.height / canvasElement.height;
            
            // 位置とサイズを設定
            container.style.position = 'absolute';
            container.style.left = `${canvasRect.left + (x * scaleX)}px`;
            container.style.top = `${canvasRect.top + (y * scaleY)}px`;
            container.style.width = `${width * scaleX}px`;
            container.style.height = `${height * scaleY}px`;
            container.style.zIndex = '1000';
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Positioning error:', error);
        }
    }
    
    /**
     * 設定値の更新（SettingsSceneメソッドの例）
     */
    updateSettingValue(settingKey: string, value: boolean): void {
        try {
            // SettingsManagerを通じて設定を更新
            if (this.gameEngine.settingsManager) {
                this.gameEngine.settingsManager.set(settingKey, value);
            }
            
            // UI上の対応する設定項目を更新
            // これは実際のSettingsSceneの実装に依存
            console.log(`[AccessibilityProfileIntegration] Setting updated: ${settingKey} = ${value}`);
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Setting update error:', error);
        }
    }
    
    /**
     * アクセシビリティ変更の通知
     */
    notifyAccessibilityChanged(): void {
        try {
            // ゲームエンジンに変更を通知
            if (this.gameEngine && typeof this.gameEngine.emit === 'function') {
                this.gameEngine.emit('accessibilityChanged', {
                    source: 'AccessibilityProfileComponent',
                    timestamp: Date.now()
                });
            }
            
            // SettingsSceneのUI再描画をトリガー
            if (this.gameEngine.sceneManager && 
                this.gameEngine.sceneManager.currentScene && 
                typeof this.gameEngine.sceneManager.currentScene.requestRedraw === 'function') {
                this.gameEngine.sceneManager.currentScene.requestRedraw();
            }
            
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Notification error:', error);
        }
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    cleanup(): void {
        try {
            if (this.accessibilityProfileComponent) {
                this.accessibilityProfileComponent.destroy();
                this.accessibilityProfileComponent = null;
            }
        } catch (error) {
            console.error('[AccessibilityProfileIntegration] Cleanup error:', error);
        }
    }
}

/**
 * SettingsSceneに統合するためのコードスニペット例
 */
export const SettingsSceneIntegrationSnippets = {
    /**
     * initializeSettingItems()メソッドのaccessibilityセクションに追加
     */
    accessibilitySettingItem: `
        // AccessibilityProfileComponentを追加
        { 
            key: 'accessibility.profile', 
            label: 'アクセシビリティプロファイル', 
            type: 'custom',
            component: 'AccessibilityProfileComponent',
            description: 'プリセットされたアクセシビリティ設定を選択できます'
        },
    `,
    
    /**
     * renderSettings()メソッドのカスタムコンポーネント処理に追加
     */
    renderCustomComponent: `
        case 'AccessibilityProfileComponent':
            if (!this.accessibilityProfileComponent) {
                this.accessibilityProfileComponent = new AccessibilityProfileComponent(this.gameEngine);
            }
            return this.renderAccessibilityProfile(ctx, x, y, width, height, setting);
    `,
    
    /**
     * handleMouseClick()メソッドのカスタムコンポーネント処理に追加
     */
    handleMouseClick: `
        // AccessibilityProfileComponentはDOM要素なのでCanvas上のクリック処理は不要
        // ただし、Canvasとの統合表示がある場合は適切な領域判定を実装
    `
};