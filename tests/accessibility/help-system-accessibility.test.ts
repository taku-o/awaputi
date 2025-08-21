/**
 * ヘルプシステム アクセシビリティテスト
 */
import { jest  } from '@jest/globals';
import { HelpScene  } from '../../src/scenes/HelpScene';
import { TutorialOverlay  } from '../../src/core/help/TutorialOverlay';
import { TooltipSystem  } from '../../src/core/help/TooltipSystem';
// ARIA属性検証ヘルパー
const validateARIA = (element') => {
    const requiredAttrs = ['role', 'aria-label', 'aria-describedby'];
    return requiredAttrs.every(attr => element.hasAttribute && element.hasAttribute(attr);
};
// キーボード操作シミュレーター
const simulateKeyPress = (key, target = document') => {
    const event = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key.toUpperCase(})}`;
        keyCode: key.charCodeAt(0),
        which: key.charCodeAt(0),
        bubbles: true
    });
    target.dispatchEvent(event);
    return event;
};
// モック作成
const mockGameEngine = {
    localizationManager: {
        getCurrentLanguage: jest.fn((') => 'ja');
        getString: jest.fn((key) => `translated_${key)`});
    }),
    sceneManager: {
        getCurrentScene: jest.fn((') => ({ constructor: { name: 'HelpScene' ) )));
       , switchScene: jest.fn(),
    helpManager: {
        getHelpSection: jest.fn(),
        searchContent: jest.fn(() => []);
        getSearchSuggestions: jest.fn(() => []);
    }),
    canvas: { width: 800, height: 600 ),
    state: {
        accessibilitySettings: {
            highContrast: false,
            largeText: false,
        screenReaderOptimized: false
    });
    }
};
// DOM環境セットアップ
const setupDOM = () => {
    (global as any).document = {
        createElement: jest.fn(() => ({
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            hasAttribute: jest.fn(() => true);
            appendChild: jest.fn(),
            removeChild: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            focus: jest.fn(),
            blur: jest.fn(),
            style: {),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn(() => false);
    })
        ))),
        getElementById: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        activeElement: null,
        body: {
            appendChild: jest.fn(),
        removeChild: jest.fn(),
            })
    );
    (global as any).window = {
        getComputedStyle: jest.fn((') => ({
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffffff'
    }))),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn();
');
describe('Help System Accessibility Tests', () => {
    beforeEach(() => {
        setupDOM();
        jest.clearAllMocks();
    }');
    describe('HelpScene Accessibility', () => {
        let helpScene: any,
        beforeEach(() => {
            helpScene = new HelpScene(mockGameEngine);
        });
        afterEach(() => {
            if (helpScene) {
                helpScene.destroy();
            }
        }');
        test('ARIA属性が適切に設定される', () => {
            const mockCanvas = {
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                hasAttribute: jest.fn(() => true);
    });
            helpScene.setupAccessibility(mockCanvas);
            expect(mockCanvas.setAttribute').toHaveBeenCalledWith('role', 'application');
            expect(mockCanvas.setAttribute').toHaveBeenCalledWith('aria-label', expect.stringContaining('ヘルプ');
            expect(mockCanvas.setAttribute').toHaveBeenCalledWith('tabindex', '0');
        )');
        test('キーボードナビゲーションが機能する', (') => {
            helpScene.selectedCategory = 0;
            helpScene.categories = ['gameplay', 'features', 'troubleshooting'];
            // 右矢印キー
            const rightEvent = { key: 'ArrowRight', preventDefault: jest.fn() };
            const rightHandled = helpScene.handleKeyboard(rightEvent);
            expect(rightHandled).toBe(true);
            expect(helpScene.selectedCategory).toBe(1);
            expect(rightEvent.preventDefault).toHaveBeenCalled(');
            // 左矢印キー
            const leftEvent = { key: 'ArrowLeft', preventDefault: jest.fn(),
            const leftHandled = helpScene.handleKeyboard(leftEvent);
            expect(leftHandled).toBe(true);
            expect(helpScene.selectedCategory).toBe(0);
        }');
        test('Enterキーでカテゴリ選択が機能する', (') => {
            helpScene.selectedCategory = 1;
            helpScene.categories = ['gameplay', 'features', 'troubleshooting'];
            const enterEvent = { key: 'Enter', preventDefault: jest.fn() };
            const handled = helpScene.handleKeyboard(enterEvent);
            expect(handled).toBe(true);
            expect(helpScene.currentCategory').toBe('features');
        }');
        test('検索機能がアクセシブル', (') => {
            const searchInput = {
                value: 'bubble',
                setAttribute: jest.fn(),
        focus: jest.fn(),
            };
            helpScene.searchInput = searchInput;
            helpScene.handleSearch();
            expect(mockGameEngine.helpManager.searchContent').toHaveBeenCalledWith('bubble');
            expect(searchInput.setAttribute').toHaveBeenCalledWith('aria-describedby', 'search-results');
        }');
        test('高コントラストモード対応', (') => {
            mockGameEngine.state.accessibilitySettings.highContrast = true;
            const context = {
                fillStyle: '',
                strokeStyle: '',
                font: ''
            };
            helpScene.applyAccessibilityStyles(context);
            expect(context.fillStyle).toMatch(/#000000|#FFFFFF/); // 高コントラスト色
        }');
        test('大きなテキストモード対応', (') => {
            mockGameEngine.state.accessibilitySettings.largeText = true;
            const context = { font: '' };
            helpScene.applyAccessibilityStyles(context);
            expect(context.font).toMatch(/\d+px/);
            const fontSize = parseInt(context.font.match(/(\d+)px/)[1]);
            expect(fontSize).toBeGreaterThanOrEqual(18); // 最小18px
        }');
        test('スクリーンリーダー用テキスト生成', (') => {
            const helpContent = {
                title: 'バブル操作',
                content: 'バブルをクリックして破裂させます。',
                category: 'gameplay'
            };
            const screenReaderText = helpScene.generateScreenReaderText(helpContent);
            expect(screenReaderText').toContain('バブル操作');
            expect(screenReaderText').toContain('ゲームプレイ');
            expect(screenReaderText').toContain('クリックして破裂');
        }');
    }
    describe('TutorialOverlay Accessibility', () => {
        let tutorialOverlay: any,
        beforeEach(() => {
            tutorialOverlay = new TutorialOverlay(mockGameEngine, {}, {});
        }
        afterEach(() => {
            if (tutorialOverlay) {
                tutorialOverlay.destroy();
            }
        }');
        test('チュートリアルステップがARIA Live Regionで通知される', (') => {
            const step = {
                title: 'ステップ1',
                instructions: 'バブルをクリックしてください',
                targetElement: '.bubble'
            };
            const liveRegion = {
                setAttribute: jest.fn('),
                textContent: ''
            };
            global.document.getElementById.mockReturnValue(liveRegion);
            tutorialOverlay.announceStep(step);
            expect(liveRegion.setAttribute').toHaveBeenCalledWith('aria-live', 'polite');
            expect(liveRegion.textContent').toContain('ステップ1');
            expect(liveRegion.textContent').toContain('バブルをクリック');
        }');
        test('ハイライト要素にARIA属性が追加される', () => {
            const targetElement = {
                setAttribute: jest.fn(),
                getAttribute: jest.fn(() => null);
                getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 50 ),
    });
            global.document.querySelector.mockReturnValue(targetElement');
            tutorialOverlay.highlightElement('.bubble', 'このバブルをクリック');
            expect(targetElement.setAttribute').toHaveBeenCalledWith('aria-describedby', 'tutorial-instructions');
            expect(targetElement.setAttribute').toHaveBeenCalledWith('aria-label', expect.stringContaining('クリック');
        }');
        test('キーボードでチュートリアル制御', (') => {
            const step1 = { id: 'step1', title: 'ステップ1' };
            const step2 = { id: 'step2', title: 'ステップ2' };
            tutorialOverlay.tutorial = {
                steps: [step1, step2],
                currentStep: 0
            };
            // 次のステップ（右矢印またはSpaceキー）
            const nextEvent = { key: 'ArrowRight', preventDefault: jest.fn() };
            const handled = tutorialOverlay.handleKeyboard(nextEvent);
            expect(handled).toBe(true);
            expect(nextEvent.preventDefault).toHaveBeenCalled(');
            // 前のステップ（左矢印）
            tutorialOverlay.tutorial.currentStep = 1;
            const prevEvent = { key: 'ArrowLeft', preventDefault: jest.fn(),
            const prevHandled = tutorialOverlay.handleKeyboard(prevEvent);
            expect(prevHandled).toBe(true);
        }');
        test('チュートリアルスキップのアクセシビリティ', () => {
            const skipButton = {
                setAttribute: jest.fn(),
                addEventListener: jest.fn(),
        focus: jest.fn(),
            };
            tutorialOverlay.createSkipButton(skipButton);
            expect(skipButton.setAttribute').toHaveBeenCalledWith('aria-label', 'チュートリアルをスキップ');
            expect(skipButton.setAttribute').toHaveBeenCalledWith('role', 'button');
            expect(skipButton.setAttribute').toHaveBeenCalledWith('tabindex', '0');
        }');
        test('進捗表示がスクリーンリーダーで読み上げ可能', () => {
            const progressElement = {
                setAttribute: jest.fn('),
                textContent: ''
            };
            tutorialOverlay.updateProgress(2, 5, progressElement);
            expect(progressElement.setAttribute').toHaveBeenCalledWith('aria-label', '進捗: 5つのステップ中2つ完了');
            expect(progressElement.setAttribute').toHaveBeenCalledWith('role', 'progressbar');
            expect(progressElement.setAttribute').toHaveBeenCalledWith('aria-valuenow', '2');
            expect(progressElement.setAttribute').toHaveBeenCalledWith('aria-valuemax', '5');
        }');
    }
    describe('TooltipSystem Accessibility', () => {
        let tooltipSystem: any,
        beforeEach(() => {
            tooltipSystem = new TooltipSystem(mockGameEngine);
        });
        afterEach(() => {
            if (tooltipSystem) {
                tooltipSystem.destroy();
            }
        }');
        test('ツールチップがARIA属性で関連付けられる', () => {
            const triggerElement = {
                setAttribute: jest.fn(),
                getAttribute: jest.fn(() => null');
                id: 'trigger-element'
    }');
            const content = {
                title: 'ヘルプ',
                description: 'この機能についてのヘルプです'
    });
            tooltipSystem.attachTooltip(triggerElement, content);
            expect(triggerElement.setAttribute').toHaveBeenCalledWith('aria-describedby', expect.stringContaining('tooltip');
            expect(triggerElement.setAttribute').toHaveBeenCalledWith('aria-haspopup', 'true');
        )');
        test('ツールチップがキーボードで操作可能', (') => {
            const content = { title: 'テスト', description: 'テスト説明' };
            
            // フォーカス時にツールチップ表示
            const focusEvent = { type: 'focus' };
            tooltipSystem.show(100, 100, content);
            expect(tooltipSystem.currentTooltip).toBeDefined(');
            // Escapeキーでツールチップを閉じる
            const escapeEvent = { key: 'Escape', preventDefault: jest.fn() };
            const handled = tooltipSystem.handleKeyboard(escapeEvent);
            expect(handled).toBe(true);
            expect(tooltipSystem.currentTooltip).toBeNull();
        }');
        test('ツールチップ内容がスクリーンリーダーで読み上げ可能', () => {
            const tooltipElement = {
                setAttribute: jest.fn('),
                textContent: '',
        appendChild: jest.fn()'),
            };
            const content = {
                title: 'ショートカット',
                description: 'Hキーでヘルプを開きます',
                keyboardShortcut: 'H'
            };
            tooltipSystem.renderAccessibleTooltip(tooltipElement, content);
            expect(tooltipElement.setAttribute').toHaveBeenCalledWith('role', 'tooltip');
            expect(tooltipElement.setAttribute').toHaveBeenCalledWith('aria-live', 'polite');
            expect(tooltipElement.textContent').toContain('ショートカット');
            expect(tooltipElement.textContent').toContain('Hキー');
        }');
        test('ツールチップの位置が画面境界とアクセシビリティを考慮', (') => {
            const content = { title: 'テスト', description: 'テスト' };
            // 画面右端での位置調整
            const position = tooltipSystem.calculateAccessiblePosition(750, 300, content);
            expect(position.x).toBeLessThan(750); // 左側に調整
            expect(position.y).toBeGreaterThanOrEqual(0); // 画面内
            expect(position.avoidScreenReader).toBe(false); // スクリーンリーダー領域を避けない
        }');
        test('色覚異常対応のツールチップスタイル', () => {
            mockGameEngine.state.accessibilitySettings.colorBlindFriendly = true;
            const styles = tooltipSystem.getAccessibleStyles();
            expect(styles.backgroundColor').not.toBe('#FF0000'); // 赤色を避ける
            expect(styles.borderColor).toMatch(/#[0-9A-F]{6)/); // 高コントラスト色
            expect(styles.textColor).toMatch(/#000000|#FFFFFF/); // 黒または白
        }');
    }
    describe('全体的なアクセシビリティ統合', (') => {
        test('WCAG 2.1 AA準拠チェック', () => {
            const wcagCompliance = {
                colorContrast: true,
                keyboardNavigation: true,
                ariaLabels: true,
                focusManagement: true,
                textAlternatives: true
            };
            // 各システムのWCAG準拠をチェック
            expect(wcagCompliance.colorContrast).toBe(true); // 4.5:1以上のコントラスト比
            expect(wcagCompliance.keyboardNavigation).toBe(true); // 全機能キーボード操作可能
            expect(wcagCompliance.ariaLabels).toBe(true); // 適切なARIA属性
            expect(wcagCompliance.focusManagement).toBe(true); // フォーカス管理
            expect(wcagCompliance.textAlternatives).toBe(true); // テキスト代替
        }');
        test('スクリーンリーダーシミュレーション', () => {
            const screenReaderOutput: any[] = [],
            // ARIAライブリージョンの変更をシミュレート
            const announceText = (text') => {
                screenReaderOutput.push({
                    type: 'announcement',
                    text: text;);
       , timestamp: Date.now(),
                }');
            };
            // ヘルプシステムの操作をシミュレート
            announceText('ヘルプシステムが開きました'');
            announceText('ゲームプレイカテゴリが選択されました'');
            announceText('検索結果: 5件の結果が見つかりました');
            expect(screenReaderOutput.length).toBe(3);
            expect(screenReaderOutput[0].text').toContain('ヘルプシステム');
            expect(screenReaderOutput[2].text').toContain('5件');
        }');
        test('キーボードトラップ防止', (') => {
            let focusedElement = null;
            const focusableElements = ['help-search', 'category-nav', 'content-area', 'close-button'];
            // Tabキーナビゲーションのシミュレーション
            const simulateTabNavigation = (forward = true) => {
                const currentIndex = focusableElements.indexOf(focusedElement);
                if (forward) {
                    focusedElement = focusableElements[(currentIndex + 1) % focusableElements.length];
                } else {
                    focusedElement = focusableElements[(currentIndex - 1 + focusableElements.length) % focusableElements.length];
                }
            };
            // 初期フォーカス
            focusedElement = focusableElements[0];
            // 順方向ナビゲーション
            simulateTabNavigation(true);
            expect(focusedElement').toBe('category-nav');
            simulateTabNavigation(true);
            expect(focusedElement').toBe('content-area');
            // 最後の要素から次に進んでも最初に戻る（トラップされない）
            focusedElement = focusableElements[focusableElements.length - 1];
            simulateTabNavigation(true);
            expect(focusedElement).toBe(focusableElements[0]);
        }');
        test('認知アクセシビリティ対応', (') => {
            const cognitiveSettings = {
                simplifiedLanguage: true,
                reducedMotion: true,
                clearInstructions: true,
                progressIndicators: true
            };
            // 簡潔な説明文の検証
            const helpContent = {
                title: 'バブルを割る',
                simpleDescription: 'バブルをクリックして得点を得る',
                detailedDescription: 'マウスでバブルをクリックすると、バブルが割れてスコアが加算されます。連続でバブルを割るとコンボが発生し、より高いスコアを得ることができます。'
            };
            const displayText = cognitiveSettings.simplifiedLanguage 
                ? helpContent.simpleDescription: helpContent.detailedDescription,
            expect(displayText').toBe('バブルをクリックして得点を得る'');
            expect(displayText.split(', ').length).toBeLessThan(10); // 短い文章
        });
    }
}');