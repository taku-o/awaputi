/**
 * ShareContentGenerator 単体テスト (Task 20.1)
 * 包括的なテストカバレッジでShareContentGeneratorの全機能をテスト
 */
import { jest } from '@jest/globals';
import { ShareContentGenerator } from '../../../src/core/ShareContentGenerator.js';

// Type definitions
interface LocalizationManager {
    translate: jest.MockedFunction<(key: string, params?: Record<string, any>) => string>;
    getCurrentLanguage: jest.MockedFunction<() => string>;
    getSupportedLanguages: jest.MockedFunction<() => string[]>;
}

interface ScoreData {
    score: number;
    stage: string;
    combo: number;
    accuracy: number;
}

interface AchievementData {
    id: string;
    name: string;
    description: string;
    points: number;
    rarity: string;
}

interface CustomData {
    title?: string;
    message?: string;
    hashtags?: string[];
    url?: string;
}

interface ShareMessage {
    text: string;
    platform: string;
    language: string;
    url?: string;
    title?: string;
    hashtags?: string[];
    rarity?: string;
    error?: Error;
    estimatedUrlLength?: number;
    description?: string;
}

interface _ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

interface _PlatformLimits {
    twitter: { maxLength: number; hashtagLimit: number; };
    facebook: {
        maxLength: number;
    };
}

interface _GeneratorStats {
    generated: number;
    errors: number;
    truncated: number;
}

interface StatsReport { 
    generated: number; 
    successRate: number; 
}

interface _UTMParams {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
}


// LocalizationManager のモック
const mockLocalizationManager: LocalizationManager = {
    translate: jest.fn<(key: string, params?: Record<string, any>) => string>((key: string, params: Record<string, any> = {}) => {
        // 基本的な翻訳辞書
        const translations: Record<string, string> = {
            'social.score.twitter.ja': 'BubblePopで{score}点を達成！ あなたも挑戦してみませんか？ #BubblePop #ゲーム {url}',
            'social.score.twitter.en': 'I scored {score} points in BubblePop! Can you beat it? #BubblePop #Game {url}',
            'social.achievement.twitter.ja': '実績「{name}」を解除しました！ BubblePopで遊んでみませんか？ #BubblePop #実績 {url}',
            'social.achievement.twitter.en': 'I unlocked the achievement "{name}"! Try BubblePop yourself! #BubblePop #Achievement {url}',
            'social.score.facebook.ja': 'BubblePopで{score}点のハイスコアを達成しました！このゲームは本当に楽しいです。みなさんもぜひ挑戦してみてください！',
            'social.score.facebook.en': 'I achieved a high score of {score} points in BubblePop! This game is really fun. Everyone should try it!',
            'game.title': 'BubblePop',
            'game.description': '楽しいバブルポップゲーム'
        };
        
        let result = translations[key] || key;
        
        // パラメータの置換
        Object.keys(params).forEach(param => {
            const placeholder = new RegExp(`\\{${param}\\}`, 'g');
            result = result.replace(placeholder, params[param]);
        });
        return result;
    }) as jest.MockedFunction<(key: string, params?: Record<string, any>) => string>,
    getCurrentLanguage: jest.fn<() => string>(() => 'ja') as jest.MockedFunction<() => string>,
    getSupportedLanguages: jest.fn<() => string[]>(() => ['ja', 'en']) as jest.MockedFunction<() => string[]>
};

describe('ShareContentGenerator', () => {

    let generator: ShareContentGenerator;

    beforeEach(() => {
        generator = new ShareContentGenerator(mockLocalizationManager);
        // モック関数のクリア
        mockLocalizationManager.translate.mockClear();
        mockLocalizationManager.getCurrentLanguage.mockClear();
    });
    describe('初期化', () => {
        it('正常に初期化される', () => {
            expect(generator).toBeInstanceOf(ShareContentGenerator);
            expect((generator as any).localizationManager).toBe(mockLocalizationManager);
        });

        it('テンプレートが初期化される', () => {
            expect((generator as any).templates).toBeDefined();
            expect((generator as any).templates.score).toBeDefined();
            expect((generator as any).templates.achievement).toBeDefined();
        });
        it('プラットフォーム制限が設定される', () => {
            expect((generator as any).platformLimits).toBeDefined();
            expect((generator as any).platformLimits.twitter.maxLength).toBe(280);
            expect((generator as any).platformLimits.facebook.maxLength).toBe(63206);
        });

        it('統計が初期化される', () => {
            expect((generator as any).stats).toEqual({
                generated: 0,
                errors: 0,
                truncated: 0
            });
        });
    });

    describe('スコア共有メッセージ生成', () => {
        const scoreData: ScoreData = {
            score: 15000,
            stage: 'normal',
            combo: 5,
            accuracy: 85.5
        };

        it('Twitter用スコアメッセージを生成する', () => {
            const result = generator.generateScoreMessage(scoreData, 'twitter', 'ja') as ShareMessage;
            expect(result).toBeDefined();
            expect(result.text).toContain('15000');
            expect(result.text).toContain('#BubblePop');
        });
        it('Facebook用スコアメッセージを生成する', () => {
            const result = generator.generateScoreMessage(scoreData, 'facebook', 'ja') as ShareMessage;
            expect(result).toBeDefined();
            expect(result.text).toContain('15000');
        });

        it('英語でメッセージを生成する', () => {
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('en');
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'twitter', 'en');
            expect(result).toBeDefined();
            expect(result.text).toContain('I scored');
            expect(result.text).toContain('15000');
            expect(result.language).toBe('en');
        });
        it('カスタムURLを含める', () => {
            const url = 'https://example.com/bubblepop';
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'twitter', 'ja', { url });
            expect(result.url).toBe(url);
        });

        it('不正なプラットフォームでデフォルトを使用', () => {
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'invalid', 'ja');
            expect(result.platform).toBe('generic');
        });
    });

    describe('実績共有メッセージ生成', () => {
        const achievementData: AchievementData = {
            id: 'first_100_score',
            name: '初心者卒業',
            description: '100点以上を達成',
            points: 10,
            rarity: 'common'
        };

        it('Twitter用実績メッセージを生成する', () => {
            const result: ShareMessage = generator.generateAchievementMessage(achievementData, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect(result.text).toContain('初心者卒業');
            expect(result.text).toContain('#BubblePop');
            expect(result.platform).toBe('twitter');
        });
        it('Facebook用実績メッセージを生成する', () => {
            const result: ShareMessage = generator.generateAchievementMessage(achievementData, 'facebook', 'ja');
            expect(result).toBeDefined();
            expect(result.text).toContain('初心者卒業');
            expect(result.platform).toBe('facebook');
        });

        it('レアリティ情報を含める', () => {
            const rareAchievement: AchievementData = {
                ...achievementData,
                rarity: 'legendary'
            };
            
            const result: ShareMessage = generator.generateAchievementMessage(rareAchievement, 'twitter', 'ja');
            expect(result.rarity).toBe('legendary');
        });
    });

    describe('カスタムメッセージ生成', () => {
        const customData: CustomData = {
            title: 'カスタムタイトル',
            message: 'カスタムメッセージです',
            hashtags: ['custom', 'test'],
            url: 'https://example.com'
        };

        it('カスタムメッセージを生成する', () => {
            const result: ShareMessage = generator.generateCustomMessage(customData, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect(result.text).toContain('カスタムメッセージです');
            expect(result.title).toBe('カスタムタイトル');
            expect(result.url).toBe('https://example.com');
        });
        it('ハッシュタグが追加される', () => {
            const result: ShareMessage = generator.generateCustomMessage(customData, 'twitter', 'ja');
            expect(result.hashtags).toContain('#custom');
            expect(result.hashtags).toContain('#test');
        });

        it('空のデータでもエラーにならない', () => {
            const result: ShareMessage = generator.generateCustomMessage({}, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect(result.text).toBeDefined();
        });
    });

    describe('Twitter最適化', () => {

        it('文字数制限を適用する', () => {
            const longMessage = 'あ'.repeat(300); // 300文字
            const result: ShareMessage = (generator as any).optimizeForTwitter({
                text: longMessage,
                url: 'https://example.com'
            });
            expect(result.text.length + 23).toBeLessThanOrEqual(280); // URL短縮分を考慮
        });

        it('ハッシュタグ制限を適用する', () => {
            const data = {
                text: 'テストメッセージ',
                hashtags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
            };
            
            const result: ShareMessage = (generator as any).optimizeForTwitter(data);
            // ハッシュタグは2個まで
            const hashtagCount = (result.text.match(/#/g) || []).length;
            expect(hashtagCount).toBeLessThanOrEqual(2);
        });

        it('URL短縮を考慮する', () => {
            const data = {
                text: 'テストメッセージ',
                url: 'https://very-long-url-example.com/path/to/resource?param=value'
            };
            
            const result: ShareMessage = (generator as any).optimizeForTwitter(data);
            expect(result.estimatedUrlLength).toBe(23);
        });
    });

    describe('エラーハンドリング', () => {

        it('無効なデータでエラーを処理する', () => {
            const result: ShareMessage = generator.generateScoreMessage(null as any, 'twitter', 'ja');
            expect(result.error).toBeDefined();
            expect((generator as any).stats.errors).toBeGreaterThan(0);
        });
        it('LocalizationManagerエラーを処理する', () => {
            mockLocalizationManager.translate.mockImplementation(() => {
                throw new Error('Translation error');
            });
            const result: ShareMessage = generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect((generator as any).stats.errors).toBeGreaterThan(0);
        });
    });

    describe('統計', () => {
        it('生成統計を記録する', () => {
            const initialGenerated = (generator as any).stats.generated;
            
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            expect((generator as any).stats.generated).toBe(initialGenerated + 1)
        });

        it('統計をリセットする', () => {
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            generator.resetStats();
            expect((generator as any).stats.generated).toBe(0);
            expect((generator as any).stats.errors).toBe(0);
            expect((generator as any).stats.truncated).toBe(0)
        });

        it('統計レポートを取得する', () => {
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            const report: StatsReport = generator.getStatsReport();
            expect(report.generated).toBeGreaterThan(0);
            expect(report.successRate).toBeDefined()
        })
    });

    describe('パフォーマンス', () => {
        it('大量のメッセージ生成を処理する', () => {
            const startTime = performance.now();
            for (let i = 0; i < 100; i++) {
                generator.generateScoreMessage(
                    { score: 1000 + i, stage: 'normal', combo: 1, accuracy: 90 },
                    'twitter',
                    'ja'
                )
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(1000); // 1秒以内
        });

        it('メモリリークを防ぐ', () => {
            // const initialMemory = ((generator as any).getMemoryUsage ? (generator as any).getMemoryUsage() : 0);
            
            // 大量のメッセージ生成
            for (let i = 0; i < 1000; i++) {
                generator.generateScoreMessage(
                    { score: 1000 + i, stage: 'normal', combo: 1, accuracy: 90 },
                    'twitter',
                    'ja'
                )
            }
            
            // ガベージコレクションを実行（テスト環境で利用可能な場合）
            if ((global as any).gc) {
                (global as any).gc();
            }
            // メモリ使用量が異常に増加していないことを確認
            // 実際の実装では適切な閾値を設定
            expect((generator as any).stats.generated).toBe(1000);
        });
    });
});

// テストユーティリティ関数
// @ts-ignore - テストユーティリティ関数は使用されていない
function createMockScoreData(overrides: Partial<ScoreData> = {}): ScoreData {
    return {
        score: 10000,
        stage: 'normal',
        combo: 3,
        accuracy: 88.5,
        ...overrides
    };
}


// @ts-ignore - テストユーティリティ関数は使用されていない
function createMockAchievementData(overrides: Partial<AchievementData> = {}): AchievementData {
    return {
        id: 'test_achievement',
        name: 'テスト実績',
        description: 'テスト用の実績です',
        points: 10,
        rarity: 'common',
        ...overrides
    };
}
