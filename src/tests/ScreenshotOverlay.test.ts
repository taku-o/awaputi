/**
 * スクリーンショットオーバーレイ機能テスト (Task 6)
 */
import { jest } from '@jest/globals';

// モック用の型定義
interface MockContext {
    drawImage: jest.Mock;
    fillText: jest.Mock;
    strokeText: jest.Mock;
    measureText: jest.Mock<{ width: number }>;
    fillRect: jest.Mock;
    strokeRect: jest.Mock;
    beginPath: jest.Mock;
    moveTo: jest.Mock;
    lineTo: jest.Mock;
    quadraticCurveTo: jest.Mock;
    closePath: jest.Mock;
    fill: jest.Mock;
    stroke: jest.Mock;
    save: jest.Mock;
    restore: jest.Mock;
    setTransform: jest.Mock;
    translate: jest.Mock;
    rotate: jest.Mock;
    scale: jest.Mock;
    clip: jest.Mock;
    font: string;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    textAlign: string;
    textBaseline: string;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    imageSmoothingEnabled: boolean;
    imageSmoothingQuality: string;
    textRenderingOptimization: string;
}

interface MockCanvas {
    width: number;
    height: number;
    getContext: jest.Mock<MockContext>;
    remove: jest.Mock;
}

interface MockGameEngine {
    canvas: MockCanvas;
}

interface ScoreData {
    score: number;
    combo?: number;
    accuracy?: number;
    stage?: string;
}

interface AchievementData {
    name: string;
    description?: string;
    rarity?: string;
}

interface CustomElement {
    type: string;
    text?: string;
    position: { x: number; y: number };
    style?: {
        fontSize?: number;
        textColor?: string;
    };
}

interface OverlayData {
    elements: CustomElement[];
}

interface OverlayOptions {
    score?: {
        fontSize?: number;
        textColor?: string;
        backgroundColor?: string;
    };
}

interface OverlayStats {
    overlaysCreated: number;
    errors: number;
    successRate: number;
    averageTimeMs: number;
}

interface ResponsiveConfig {
    score: {
        fontSize: number;
    };
    logo: {
        fontSize: number;
    };
    layout: {
        scorePosition: string;
        logoPosition?: string;
    };
}

interface PresetConfig {
    logo?: {
        enabled: boolean;
        textColor?: string;
    };
    watermark?: {
        enabled: boolean;
    };
    score?: {
        borderWidth?: number;
        backgroundColor?: string;
        fontSize?: number;
    };
}

interface ScreenshotOverlay {
    gameEngine: MockGameEngine;
    config: any;
    stats: any;
    cache: {
        fonts: Map<string, any>;
        images: Map<string, any>;
    };
    createScoreOverlay: (canvas: MockCanvas, scoreData: ScoreData | null, options?: OverlayOptions) => Promise<any>;
    createAchievementOverlay: (canvas: MockCanvas, achievementData: AchievementData | null) => Promise<any>;
    createCustomOverlay: (canvas: MockCanvas, overlayData: OverlayData) => Promise<any>;
    calculatePosition: (position: string | { x: number; y: number }, width: number, height: number, canvasWidth: number, canvasHeight: number, padding: number) => { x: number; y: number };
    wrapText: (context: MockContext, text: string, maxWidth: number) => string[];
    formatNumber: (num: number) => string;
    getResponsiveConfig: (width: number, height: number) => ResponsiveConfig;
    getPresetConfig: (preset: string) => PresetConfig;
    updateConfig: (newConfig: any) => void;
    clearCache: () => void;
    getStats: () => OverlayStats;
}

describe('ScreenshotOverlay', () => {
    let screenshotOverlay: ScreenshotOverlay;
    let mockGameEngine: MockGameEngine;
    let mockCanvas: MockCanvas;
    let mockContext: MockContext;

    beforeEach(async () => {
        // Canvas Context APIのモック
        mockContext = {
            drawImage: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn<{ width: number }>().mockReturnValue({ width: 100 }),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            quadraticCurveTo: jest.fn(),
            closePath: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            setTransform: jest.fn(),
            translate: jest.fn(),
            rotate: jest.fn(),
            scale: jest.fn(),
            clip: jest.fn(),
            font: '16px Arial',
            fillStyle: '#000000',
            strokeStyle: '#000000',
            lineWidth: 1,
            textAlign: 'left',
            textBaseline: 'top',
            shadowColor: 'transparent',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
            textRenderingOptimization: 'optimizeQuality'
        };
        
        // Canvas APIのモック
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn<MockContext>().mockReturnValue(mockContext),
            remove: jest.fn()
        };

        // document.createElement のモック
        document.createElement = jest.fn().mockImplementation((tagName: string) => {
            if (tagName === 'canvas') {
                return { ...mockCanvas };
            }
            return {};
        });

        // GameEngineのモック
        mockGameEngine = { canvas: mockCanvas };

        const { ScreenshotOverlay } = await import('../core/ScreenshotOverlay.ts');
        screenshotOverlay = new ScreenshotOverlay(mockGameEngine);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect(screenshotOverlay.gameEngine).toBe(mockGameEngine);
            expect(screenshotOverlay.config).toBeDefined();
            expect(screenshotOverlay.stats).toBeDefined();
            expect(screenshotOverlay.cache).toBeDefined();
        });

        test('デフォルト設定が正しく設定される', () => {
            expect(screenshotOverlay.config.layout.scorePosition).toBe('top-right');
            expect(screenshotOverlay.config.score.enabled).toBe(true);
            expect(screenshotOverlay.config.logo.enabled).toBe(true);
            expect(screenshotOverlay.config.watermark.enabled).toBe(true);
        });
    });

    describe('スコアオーバーレイ', () => {
        test('基本的なスコアオーバーレイが作成される', async () => {
            const scoreData: ScoreData = {
                score: 1500,
                combo: 10,
                accuracy: 0.85,
                stage: 'normal'
            };

            const result = await screenshotOverlay.createScoreOverlay(mockCanvas, scoreData);
            expect(result).toBeDefined();
            expect(result.width).toBe(800);
            expect(result.height).toBe(600);
            expect(mockContext.drawImage).toHaveBeenCalledWith(mockCanvas, 0, 0);
            expect(mockContext.fillText).toHaveBeenCalled();
        });

        test('スコアのみの場合でも動作する', async () => {
            const scoreData: ScoreData = { score: 2000 };
            const result = await screenshotOverlay.createScoreOverlay(mockCanvas, scoreData);
            expect(result).toBeDefined();
            expect(mockContext.fillText).toHaveBeenCalled();
        });

        test('カスタム設定でオーバーレイが作成される', async () => {
            const scoreData: ScoreData = { score: 3000 };
            const options: OverlayOptions = {
                score: {
                    fontSize: 32,
                    textColor: '#FF0000',
                    backgroundColor: 'rgba(0, 0, 255, 0.8)'
                }
            };
            
            const result = await screenshotOverlay.createScoreOverlay(mockCanvas, scoreData, options);
            expect(result).toBeDefined();
            expect(mockContext.font).toContain('32px');
        });

        test('ロゴとウォーターマークが描画される', async () => {
            const scoreData: ScoreData = { score: 1200 };
            await screenshotOverlay.createScoreOverlay(mockCanvas, scoreData);

            // ロゴテキストの描画確認
            expect(mockContext.fillText).toHaveBeenCalledWith('BubblePop', expect.any(Number), expect.any(Number));
            // ウォーターマークテキストの描画確認
            expect(mockContext.fillText).toHaveBeenCalledWith('play.bubblepop.game', expect.any(Number), expect.any(Number));
        });

        test('統計が正しく更新される', async () => {
            const scoreData: ScoreData = { score: 1800 };
            await screenshotOverlay.createScoreOverlay(mockCanvas, scoreData);
            const stats = screenshotOverlay.getStats();
            expect(stats.overlaysCreated).toBe(1);
            expect(stats.averageTimeMs).toBeGreaterThan(0);
        });
    });

    describe('実績オーバーレイ', () => {
        test('基本的な実績オーバーレイが作成される', async () => {
            const achievementData: AchievementData = {
                name: 'スコアマスター',
                description: '累計スコア10万点達成',
                rarity: 'rare'
            };

            const result = await screenshotOverlay.createAchievementOverlay(mockCanvas, achievementData);
            expect(result).toBeDefined();
            expect(mockContext.fillText).toHaveBeenCalledWith('🏆 実績解除！', expect.any(Number), expect.any(Number));
            expect(mockContext.fillText).toHaveBeenCalledWith('スコアマスター', expect.any(Number), expect.any(Number));
        });

        test('長い説明文が折り返される', async () => {
            const achievementData: AchievementData = {
                name: 'エキスパート',
                description: 'これは非常に長い説明文で、複数行に折り返されることを確認するためのテストです。'
            };

            const result = await screenshotOverlay.createAchievementOverlay(mockCanvas, achievementData);
            expect(result).toBeDefined();
            // fillTextが複数回呼ばれることで折り返しを確認
            expect(mockContext.fillText.mock.calls.length).toBeGreaterThan(3);
        });

        test('説明なしの実績でも動作する', async () => {
            const achievementData: AchievementData = { name: 'シンプル実績' };
            const result = await screenshotOverlay.createAchievementOverlay(mockCanvas, achievementData);
            expect(result).toBeDefined();
            expect(mockContext.fillText).toHaveBeenCalledWith('シンプル実績', expect.any(Number), expect.any(Number));
        });
    });

    describe('カスタムオーバーレイ', () => {
        test('カスタム要素が描画される', async () => {
            const overlayData: OverlayData = {
                elements: [{
                    type: 'text',
                    text: 'カスタムテキスト',
                    position: { x: 100, y: 100 },
                    style: {
                        fontSize: 24,
                        textColor: '#00FF00'
                    }
                }]
            };
            
            const result = await screenshotOverlay.createCustomOverlay(mockCanvas, overlayData);
            expect(result).toBeDefined();
            expect(mockContext.fillText).toHaveBeenCalledWith('カスタムテキスト', expect.any(Number), expect.any(Number));
        });

        test('複数の要素が描画される', async () => {
            const overlayData: OverlayData = {
                elements: [
                    { type: 'text', text: 'テキスト1', position: { x: 50, y: 50 } },
                    { type: 'text', text: 'テキスト2', position: { x: 150, y: 150 } }
                ]
            };
            
            const result = await screenshotOverlay.createCustomOverlay(mockCanvas, overlayData);
            expect(result).toBeDefined();
            expect(mockContext.fillText).toHaveBeenCalledWith('テキスト1', expect.any(Number), expect.any(Number));
            expect(mockContext.fillText).toHaveBeenCalledWith('テキスト2', expect.any(Number), expect.any(Number));
        });

        test('要素なしでも基本オーバーレイが動作する', async () => {
            const overlayData: OverlayData = { elements: [] };
            const result = await screenshotOverlay.createCustomOverlay(mockCanvas, overlayData);
            expect(result).toBeDefined();
            // ロゴとウォーターマークは描画される
            expect(mockContext.fillText).toHaveBeenCalled();
        });
    });

    describe('位置計算', () => {
        test('top-left位置が正しく計算される', () => {
            const position = screenshotOverlay.calculatePosition('top-left', 100, 50, 800, 600, 20);
            expect(position.x).toBe(20);
            expect(position.y).toBe(20);
        });

        test('bottom-right位置が正しく計算される', () => {
            const position = screenshotOverlay.calculatePosition('bottom-right', 100, 50, 800, 600, 20);
            expect(position.x).toBe(680); // 800 - 100 - 20
            expect(position.y).toBe(530); // 600 - 50 - 20
        });

        test('center位置が正しく計算される', () => {
            const position = screenshotOverlay.calculatePosition('center', 100, 50, 800, 600, 0);
            expect(position.x).toBe(350); // (800 - 100) / 2
            expect(position.y).toBe(275); // (600 - 50) / 2
        });

        test('カスタム座標が正しく適用される', () => {
            const customPos = { x: 123, y: 456 };
            const position = screenshotOverlay.calculatePosition(customPos, 100, 50, 800, 600, 20);
            expect(position.x).toBe(123);
            expect(position.y).toBe(456);
        });

        test('負の座標が0に調整される', () => {
            const position = screenshotOverlay.calculatePosition('top-left', 100, 50, 800, 600, -10);
            expect(position.x).toBe(0);
            expect(position.y).toBe(0);
        });
    });

    describe('テキスト処理', () => {
        test('テキストが正しく折り返される', () => {
            (mockContext.measureText as jest.Mock<{ width: number }>)
                .mockReturnValueOnce({ width: 80 })  // "Lorem ipsum"
                .mockReturnValueOnce({ width: 120 }) // "Lorem ipsum dolor"
                .mockReturnValueOnce({ width: 60 })  // "dolor"
                .mockReturnValueOnce({ width: 90 })  // "dolor sit"
                .mockReturnValueOnce({ width: 40 }); // "sit"

            const wrapped = screenshotOverlay.wrapText(mockContext, 'Lorem ipsum dolor sit', 100);
            expect(wrapped).toEqual(['Lorem ipsum', 'dolor', 'sit']);
        });

        test('短いテキストは折り返されない', () => {
            (mockContext.measureText as jest.Mock<{ width: number }>).mockReturnValue({ width: 50 });
            const wrapped = screenshotOverlay.wrapText(mockContext, 'Short text', 100);
            expect(wrapped).toEqual(['Short text']);
        });

        test('数値が正しくフォーマットされる', () => {
            expect(screenshotOverlay.formatNumber(1000)).toBe('1,000');
            expect(screenshotOverlay.formatNumber(1234567)).toBe('1,234,567');
        });
    });

    describe('レスポンシブ機能', () => {
        test('モバイルサイズでフォントが調整される', () => {
            const responsiveConfig = screenshotOverlay.getResponsiveConfig(400, 300); // モバイルサイズ
            
            expect(responsiveConfig.score.fontSize).toBeLessThan(screenshotOverlay.config.score.fontSize);
            expect(responsiveConfig.logo.fontSize).toBeLessThan(screenshotOverlay.config.logo.fontSize);
        });

        test('ポートレートモードで位置が調整される', () => {
            const responsiveConfig = screenshotOverlay.getResponsiveConfig(400, 800); // ポートレート
            expect(responsiveConfig.layout.scorePosition).toBe('top-center');
            expect(responsiveConfig.layout.logoPosition).toBe('bottom-center');
        });

        test('ランドスケープモードでデフォルト設定が維持される', () => {
            const responsiveConfig = screenshotOverlay.getResponsiveConfig(800, 400); // ランドスケープ
            expect(responsiveConfig.layout.scorePosition).toBe(screenshotOverlay.config.layout.scorePosition);
        });
    });

    describe('プリセット設定', () => {
        test('minimalプリセットが正しく取得される', () => {
            const preset = screenshotOverlay.getPresetConfig('minimal');
            expect(preset.logo?.enabled).toBe(false);
            expect(preset.watermark?.enabled).toBe(false);
            expect(preset.score?.borderWidth).toBe(0);
        });

        test('elegantプリセットが正しく取得される', () => {
            const preset = screenshotOverlay.getPresetConfig('elegant');
            expect(preset.score?.backgroundColor).toBe('rgba(50, 50, 70, 0.9)');
            expect(preset.logo?.textColor).toBe('#FF8C69');
        });

        test('gamingプリセットが正しく取得される', () => {
            const preset = screenshotOverlay.getPresetConfig('gaming');
            expect(preset.score?.backgroundColor).toBe('rgba(0, 255, 0, 0.8)');
            expect(preset.score?.fontSize).toBe(28);
        });

        test('存在しないプリセットで空オブジェクトが返される', () => {
            const preset = screenshotOverlay.getPresetConfig('nonexistent');
            expect(preset).toEqual({});
        });
    });

    describe('設定管理', () => {
        test('設定が正しく更新される', () => {
            const newConfig = {
                score: { fontSize: 30 },
                logo: { textColor: '#123456' }
            };
            screenshotOverlay.updateConfig(newConfig);

            expect(screenshotOverlay.config.score.fontSize).toBe(30);
            expect(screenshotOverlay.config.logo.textColor).toBe('#123456');
            // 他の設定は保持される
            expect(screenshotOverlay.config.score.enabled).toBe(true);
        });

        test('深いマージが正しく動作する', () => {
            const newConfig = {
                layout: { padding: 30 }
            };
            screenshotOverlay.updateConfig(newConfig);
            expect(screenshotOverlay.config.layout.padding).toBe(30);
            // 他のlayout設定は保持される
            expect(screenshotOverlay.config.layout.scorePosition).toBe('top-right');
        });
    });

    describe('エラーハンドリング', () => {
        test('スコアデータなしでエラーが適切に処理される', async () => {
            await expect(screenshotOverlay.createScoreOverlay(mockCanvas, null))
                .rejects.toThrow();
            const stats = screenshotOverlay.getStats();
            expect(stats.errors).toBe(1);
        });

        test('実績データなしでエラーが適切に処理される', async () => {
            await expect(screenshotOverlay.createAchievementOverlay(mockCanvas, null))
                .rejects.toThrow();
            const stats = screenshotOverlay.getStats();
            expect(stats.errors).toBe(1);
        });

        test('Canvasエラー時の処理', async () => {
            mockContext.drawImage = jest.fn(() => {
                throw new Error('Canvas error');
            });

            await expect(screenshotOverlay.createScoreOverlay(mockCanvas, { score: 1000 }))
                .rejects.toThrow('Canvas error');
        });
    });

    describe('パフォーマンス', () => {
        test('キャッシュがクリアされる', () => {
            screenshotOverlay.cache.fonts.set('test', 'value');
            screenshotOverlay.cache.images.set('test', 'value');
            screenshotOverlay.clearCache();
            expect(screenshotOverlay.cache.fonts.size).toBe(0);
            expect(screenshotOverlay.cache.images.size).toBe(0);
        });

        test('統計が正しく計算される', async () => {
            await screenshotOverlay.createScoreOverlay(mockCanvas, { score: 1000 });
            await screenshotOverlay.createScoreOverlay(mockCanvas, { score: 2000 });
            const stats = screenshotOverlay.getStats();
            expect(stats.overlaysCreated).toBe(2);
            expect(stats.successRate).toBe(100);
            expect(stats.averageTimeMs).toBeGreaterThan(0);
        });
    });
});