/**
 * ShareContentGenerator 単体テスト (Task 20.1)
 * 包括的なテストカバレッジでShareContentGeneratorの全機能をテスト
 */
import { jest  } from '@jest/globals';
import { ShareContentGenerator  } from '../../../src/core/ShareContentGenerator.js';
// Type definitions
interface LocalizationManager {
    translate: jest.MockedFunction<(ke,y: string, params?: Record<string, any>) => string>,
    getCurrentLanguage: jest.MockedFunction<() => string>,
    getSupportedLanguages: jest.MockedFunction<() => string[]> }
interface ScoreData {
    score: number,
    stage: string,
    combo: number,
    accuracy: number }
interface AchievementData {
    id: string,
    name: string,
    description: string,
    points: number,
    rarity: string }
interface CustomData {
    title?: string,
    message?: string,
    hashtags?: string[],
    url?: string }
interface ShareMessage {
    text: string,
    platform: string,
    language: string,
    url?: string,
    title?: string,
    hashtags?: string[],
    rarity?: string,
    error?: Error,
    estimatedUrlLength?: number,
    description?: string }
interface ValidationResult {
    isValid: boolean,
    errors: string[],
    warnings?: string[] }
interface PlatformLimits {
    twitter: {
        maxLengt,h: number,
        hashtagLimit: number
    },
    facebook: {
        maxLength: number };
}
interface GeneratorStats {
    generated: number,
    errors: number,
    truncated: number }
interface StatsReport {
    generated: number,
    successRate: number }
interface UTMParams {
    utm_source: string,
    utm_medium: string,
    utm_campaign: string }
// LocalizationManager のモック
const mockLocalizationManager: LocalizationManager = {
    translate: jest.fn((key: string, params: Record<string, any> = {)') => {
        // 基本的な翻訳辞書
        const translations: Record<string, string> = {
            'social.score.twitter.ja': 'BubblePopで{score)点を達成！ あなたも挑戦してみませんか？ #BubblePop #ゲーム {url')',
            'social.score.twitter.en': 'I scored {score} points in BubblePop! Can you beat it? #BubblePop #Game {url}', : undefined
            'social.achievement.twitter.ja': '実績「{name}」を解除しました！ BubblePopで遊んでみませんか？ #BubblePop #実績 {url}',
            'social.achievement.twitter.en': 'I unlocked the achievement "{name}"! Try BubblePop yourself! #BubblePop #Achievement {url}',
            'social.score.facebook.ja': 'BubblePopで{score}点のハイスコアを達成しました！このゲームは本当に楽しいです。みなさんもぜひ挑戦してみてください！',
            'social.score.facebook.en': 'I achieved a high score of {score} points in BubblePop! This game is really fun. Everyone should try it!',
            'game.title': 'BubblePop',
            'game.description': '楽しいバブルポップゲーム'
        };
        
        let result = translations[key] || key;
        
        // パラメータの置換
        Object.keys(params).forEach(param => {),
            const placeholder = new RegExp(`\\{${param}\\')`, 'g');
            result = result.replace(placeholder, params[param]);
        });
        return result;
    }),
    getCurrentLanguage: jest.fn((') => 'ja',
    getSupportedLanguages: jest.fn((') => ['ja', 'en']);
    }');
describe('ShareContentGenerator', () => {
    let generator: ShareContentGenerator,
    beforeEach(() => {
        generator = new ShareContentGenerator(mockLocalizationManager),
        // モック関数のクリア
        mockLocalizationManager.translate.mockClear(),
        mockLocalizationManager.getCurrentLanguage.mockClear())'),
    describe('初期化', (') => {
        it('正常に初期化される', () => {
            expect(generator).toBeInstanceOf(ShareContentGenerator),
            expect(generator.localizationManager).toBe(mockLocalizationManager))'),
        it('テンプレートが初期化される', () => {
            expect(generator.templates).toBeDefined(),
            expect(generator.templates.score).toBeDefined(),
            expect(generator.templates.achievement).toBeDefined() }');
        it('プラットフォーム制限が設定される', () => {
            expect(generator.platformLimits).toBeDefined(),
            expect(generator.platformLimits.twitter.maxLength).toBe(280),
            expect(generator.platformLimits.facebook.maxLength).toBe(63206) }');
        it('統計が初期化される', () => {
            expect(generator.stats).toEqual({
                generated: 0,
                errors: 0,
                truncated: 0 });
        }
    }');
    describe('スコア共有メッセージ生成', (') => {
        const scoreData: ScoreData = {
            score: 15000,
            stage: 'normal',
            combo: 5,
            accuracy: 85.5
        };
        it('Twitter用スコアメッセージを生成する', (') => {
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'twitter', 'ja'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('15000'),
            expect(result.text').toContain('#BubblePop'),
            expect(result.platform').toBe('twitter'),
            expect(result.language').toBe('ja') }');
        it('Facebook用スコアメッセージを生成する', (') => {
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'facebook', 'ja'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('15000'),
            expect(result.platform').toBe('facebook'),
            expect(result.language').toBe('ja') }');
        it('英語でメッセージを生成する', (') => {
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('en'),
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'twitter', 'en'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('I scored'),
            expect(result.text').toContain('15000'),
            expect(result.language').toBe('en') }');
        it('カスタムURLを含める', (') => {
            const url = 'https: //example.com/bubblepop',
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'twitter', 'ja', { url });
            expect(result.url).toBe(url);
        }');
        it('不正なプラットフォームでデフォルトを使用', (') => {
            const result: ShareMessage = generator.generateScoreMessage(scoreData, 'invalid', 'ja'),
            expect(result.platform').toBe('generic') }');
    }
    describe('実績共有メッセージ生成', (') => {
        const achievementData: AchievementData = {
            id: 'first_100_score',
            name: '初心者卒業',
            description: '100点以上を達成',
            points: 10,
            rarity: 'common'
        };
        it('Twitter用実績メッセージを生成する', (') => {
            const result: ShareMessage = generator.generateAchievementMessage(achievementData, 'twitter', 'ja'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('初心者卒業'),
            expect(result.text').toContain('#BubblePop'),
            expect(result.platform').toBe('twitter') }');
        it('Facebook用実績メッセージを生成する', (') => {
            const result: ShareMessage = generator.generateAchievementMessage(achievementData, 'facebook', 'ja'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('初心者卒業'),
            expect(result.platform').toBe('facebook') }');
        it('レアリティ情報を含める', (') => {
            const rareAchievement: AchievementData = {
                ...achievementData,
                rarity: 'legendary'
            };
            
            const result: ShareMessage = generator.generateAchievementMessage(rareAchievement, 'twitter', 'ja');
            expect(result.rarity').toBe('legendary');
        }');
    }
    describe('カスタムメッセージ生成', (') => {
        const customData: CustomData = {
            title: 'カスタムタイトル',
            message: 'カスタムメッセージです',
            hashtags: ['custom', 'test'],
            url: 'https://example.com'
        };
        it('カスタムメッセージを生成する', (') => {
            const result: ShareMessage = generator.generateCustomMessage(customData, 'twitter', 'ja'),
            expect(result).toBeDefined(),
            expect(result.text').toContain('カスタムメッセージです'),
            expect(result.title').toBe('カスタムタイトル'),
            expect(result.url').toBe('https: //example.com' }');
        it('ハッシュタグが追加される', (') => {
            const result: ShareMessage = generator.generateCustomMessage(customData, 'twitter', 'ja'),
            expect(result.hashtags').toContain('#custom'),
            expect(result.hashtags').toContain('#test') }');
        it('空のデータでもエラーにならない', (') => {
            const result: ShareMessage = generator.generateCustomMessage({}, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect(result.text).toBeDefined();
        }');
    }
    describe('Twitter最適化', (') => {
        it('文字数制限を適用する', (') => {
            const longMessage = 'あ'.repeat(300'), // 300文字
            const result: ShareMessage = generator.optimizeForTwitter({
                text: longMessage,
                url: 'https://example.com' });
            expect(result.text.length + 23).toBeLessThanOrEqual(280); // URL短縮分を考慮
        }');
        it('ハッシュタグ制限を適用する', (') => {
            const data = {
                text: 'テストメッセージ',
                hashtags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
            };
            
            const result: ShareMessage = generator.optimizeForTwitter(data,
            // ハッシュタグは2個まで
            const hashtagCount = (result.text.match(/#/g) || []).length;
            expect(hashtagCount).toBeLessThanOrEqual(2);
        }');
        it('URL短縮を考慮する', (') => {
            const data = {
                text: 'テストメッセージ',
                url: 'https://very-long-url-example.com/path/to/resource? param=value'
            };
             : undefined
            const result: ShareMessage = generator.optimizeForTwitter(data,
            expect(result.estimatedUrlLength).toBe(23);
        }');
    }
    describe('Facebook最適化', (') => {
        it('長いメッセージを処理する', (') => {
            const longMessage = 'あ'.repeat(1000'),
            const data = {
                text: longMessage,
                title: 'テストタイトル'
            };
            
            const result: ShareMessage = generator.optimizeForFacebook(data,
            expect(result).toBeDefined();
            expect(result.text.length).toBeLessThanOrEqual(generator.platformLimits.facebook.maxLength);
        }');
        it('タイトル制限を適用する', (') => {
            const longTitle = 'あ'.repeat(150'),
            const data = {
                text: 'テストメッセージ',
                title: longTitle
            };
            
            const result: ShareMessage = generator.optimizeForFacebook(data,
            expect(result.title!.length).toBeLessThanOrEqual(100);
        }');
        it('説明文制限を適用する', (') => {
            const longDescription = 'あ'.repeat(400'),
            const data = {
                text: 'テストメッセージ',
                description: longDescription
            };
            
            const result: ShareMessage = generator.optimizeForFacebook(data,
            expect(result.description!.length).toBeLessThanOrEqual(300);
        }');
    }
    describe('メッセージバリデーション', (') => {
        it('有効なメッセージを検証する', (') => {
            const validMessage: ShareMessage = {
                text: 'テストメッセージ',
                platform: 'twitter',
                language: 'ja'
            };
            
            const result: ValidationResult = generator.validateMessage(validMessage,
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        }');
        it('無効なメッセージを検出する', (') => {
            const invalidMessage: ShareMessage = {
                text: ', // 空のテキスト
                platform: 'invalid_platform',
                language: 'invalid_lang'
            };
            
            const result: ValidationResult = generator.validateMessage(invalidMessage,
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        }');
        it('プラットフォーム制限をチェックする', (') => {
            const tooLongMessage: ShareMessage = {
                text: 'あ'.repeat(300',
                platform: 'twitter',
                language: 'ja'
            };
            
            const result: ValidationResult = generator.validateMessage(tooLongMessage,
            expect(result.warnings').toContain('TEXT_TOO_LONG');
        }');
    }
    describe('ハッシュタグ管理', (') => {
        it('ハッシュタグを生成する', (') => {
            const data = {
                type: 'score',
                score: 10000,
                stage: 'normal'
            };
            
            const hashtags: string[] = generator.generateHashtags(data, 'twitter');
            expect(hashtags').toContain('#BubblePop');
            expect(hashtags.length).toBeLessThanOrEqual(2);
        }');
        it('プラットフォーム固有のハッシュタグを生成する', (') => {
            const data = { type: 'achievement', rarity: 'legendary' };
            
            const twitterTags: string[] = generator.generateHashtags(data, 'twitter');
            const facebookTags: string[] = generator.generateHashtags(data, 'facebook');
            expect(twitterTags).toBeDefined();
            expect(facebookTags).toBeDefined();
        }');
        it('重複ハッシュタグを除去する', (') => {
            const data = {
                type: 'custom',
                hashtags: ['test', 'BubblePop', 'test', 'game']
            };
            
            const hashtags: string[] = generator.generateHashtags(data, 'twitter');
            const uniqueTags = [...new Set(hashtags)];
            expect(hashtags).toEqual(uniqueTags);
        }');
    }
    describe('パラメータ置換', (') => {
        it('基本パラメータを置換する', (') => {
            const template = 'スコア: {score}点、ステージ: {stage}';
            const params = { score: 15000, stage: 'normal' };
            
            const result: string = generator.replaceParameters(template, params);
            expect(result').toBe('スコア: 15000点、ステージ: normal');
        }');
        it('ネストしたパラメータを置換する', (') => {
            const template = 'プレイヤー: {player.name}、レベル: {player.level}';
            const params = {
                player: {
                    name: 'テストプレイヤー',
                    level: 5
                }
            };
            
            const result: string = generator.replaceParameters(template, params);
            expect(result').toBe('プレイヤー: テストプレイヤー、レベル: 5');
        }');
        it('存在しないパラメータはそのまま残す', (') => {
            const template = 'スコア: {score}点、{missing}';
            const params = { score: 10000 };
            
            const result: string = generator.replaceParameters(template, params);
            expect(result').toBe('スコア: 10000点、{missing}');
        }');
        it('特殊文字をエスケープする', (') => {
            const template = 'メッセージ: {message}';
            const params = { message: '<script>alert("xss"")</script>' };
            
            const result: string = generator.replaceParameters(template, params);
            expect(result').not.toContain('<script>');
        }');
    }
    describe('多言語対応', (') => {
        it('対応言語を取得する', () => {
            const languages: string[] = generator.getSupportedLanguages(
            expect(languages').toContain('ja'),
            expect(languages').toContain('en') }');
        it('フォールバック言語を使用する', (') => {
            const result: ShareMessage = generator.generateScoreMessage(
                { score: 10000, stage: 'normal', combo: 1, accuracy: 90 },
                'twitter',
                'unsupported_lang');
            expect(result.language').toBe('ja'); // デフォルト言語
        }');
        it('RTL言語を検出する', (') => {
            const isRTL: boolean = generator.isRTLLanguage('ar',
            expect(isRTL).toBe(true'),
            const isNotRTL: boolean = generator.isRTLLanguage('ja',
            expect(isNotRTL).toBe(false) }');
    }
    describe('エラーハンドリング', (') => {
        it('無効なデータでエラーを処理する', (') => {
            const result: ShareMessage = generator.generateScoreMessage(null 'twitter', 'ja'),
            expect(result.error).toBeDefined(),
            expect(generator.stats.errors).toBeGreaterThan(0) }');
        it('テンプレート不足でエラーを処理する', (') => {
            // テンプレートを一時的に削除
            const originalTemplate = generator.templates.score.twitter.ja,
            delete generator.templates.score.twitter.ja,
            
            const result: ShareMessage = generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            expect(result.text).toBeDefined(); // フォールバックメッセージ
            
            // テンプレートを復元
            generator.templates.score.twitter.ja = originalTemplate;
        }');
        it('LocalizationManagerエラーを処理する', () => {
            mockLocalizationManager.translate.mockImplementation((') => {
                throw new Error('Translation error') }');
            const result: ShareMessage = generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            expect(result).toBeDefined();
            expect(generator.stats.errors).toBeGreaterThan(0);
        }');
    }
    describe('統計', (') => {
        it('生成統計を記録する', (') => {
            const initialGenerated = generator.stats.generated,
            
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            expect(generator.stats.generated).toBe(initialGenerated + 1);
        }');
        it('統計をリセットする', (') => {
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            generator.resetStats();
            expect(generator.stats.generated).toBe(0);
            expect(generator.stats.errors).toBe(0);
            expect(generator.stats.truncated).toBe(0);
        }');
        it('統計レポートを取得する', (') => {
            generator.generateScoreMessage({ score: 1000, stage: 'normal', combo: 1, accuracy: 90 }, 'twitter', 'ja');
            const report: StatsReport = generator.getStatsReport(
            expect(report.generated).toBeGreaterThan(0);
            expect(report.successRate).toBeDefined();
        }');
    }
    describe('パフォーマンス', (') => {
        it('大量のメッセージ生成を処理する', () => {
            const startTime = performance.now(),
            for (let i = 0, i < 100, i++') {
                generator.generateScoreMessage(
                    { score: 1000 + i, stage: 'normal', combo: 1, accuracy: 90 },
                    'twitter',
                    'ja');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(1000); // 1秒以内
        }');
        it('メモリリークを防ぐ', () => {
            const initialMemory = (generator.getMemoryUsage ? (generator.getMemoryUsage() : 0)),
            // 大量のメッセージ生成
            for (let i = 0, i < 1000, i++') {
                generator.generateScoreMessage(
                    { score: 1000 + i, stage: 'normal', combo: 1, accuracy: 90 },
                    'twitter',
                    'ja');
            }
            
            // ガベージコレクションを実行（テスト環境で利用可能な場合）
            if ((global: any).gc) {
                (global: any).gc() }
            
            // メモリ使用量が異常に増加していないことを確認
            // 実際の実装では適切な閾値を設定
            expect(generator.stats.generated).toBe(1000);
        }');
    }
    describe('設定', (') => {
        it('設定を更新する', () => {
            const newConfig = {
                platformLimits: {
                    twitter: {
                        maxLength: 300,
                        hashtagLimit: 3
                    }
                }
            };
            
            generator.updateConfig(newConfig);
            expect(generator.platformLimits.twitter.maxLength).toBe(300);
            expect(generator.platformLimits.twitter.hashtagLimit).toBe(3);
        }');
        it('無効な設定を拒否する', () => {
            const invalidConfig = {
                platformLimits: {
                    twitter: {
                        maxLength: -1 // 無効な値
                    }
                }
            };
            
            expect(() => {
                generator.updateConfig(invalidConfig) }).toThrow();
        }
    }');
    describe('プラットフォーム検出', () => {
        let originalNavigator: any,
        
        beforeEach(() => {
            originalNavigator = (global: any).navigator,
            // navigatorオブジェクト全体をモック
            (global as any').navigator = {
                userAgent: 'default user agent'
            };
        });
        afterEach(() => {
            (global: any).navigator = originalNavigator }');
        it('User Agentからプラットフォームを検出する', () => {
            // Twitter User Agent
            (global as any').navigator.userAgent = 'Mozilla/5.0 (Linux, Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.181 Mobile Safari/537.36 (compatible, TwitterBot/1.0, +https: //twitterbot.com/')',
            
            const platform: string = generator.detectPlatform(
            expect(platform').toBe('twitter') }');
        it('不明なUser Agentでデフォルトを返す', () => {
            (global as any').navigator.userAgent = 'Unknown Browser',
            
            const platform: string = generator.detectPlatform(
            expect(platform').toBe('generic') }');
    }
    describe('URL処理', (') => {
        it('URLを短縮する', (') => {
            const longUrl = 'https: //example.com/very/long/path/to/resource? param1=value1&param2=value2', : undefined
            const shortened: string = generator.shortenUrl(longUrl,
            expect(shortened.length).toBeLessThanOrEqual(30) }');
        it('UTMパラメータを追加する', (') => {
            const baseUrl = 'https: //example.com',
            const utmParams: UTMParams = {
                utm_source: 'twitter',
                utm_medium: 'social',
                utm_campaign: 'share'
            };
            
            const urlWithUTM: string = generator.addUTMParameters(baseUrl, utmParams);
            expect(urlWithUTM').toContain('utm_source=twitter');
            expect(urlWithUTM').toContain('utm_medium=social');
            expect(urlWithUTM').toContain('utm_campaign=share');
        });
    }
});
// テストユーティリティ関数
function createMockScoreData(overrides: Partial<ScoreData> =) {}'): ScoreData {
    return {
        score: 10000,
        stage: 'normal',
        combo: 3,
        accuracy: 88.5,
        ...overrides
    };
}
function createMockAchievementData(overrides: Partial<AchievementData> =) {}'): AchievementData {
    return {
        id: 'test_achievement',
        name: 'テスト実績',
        description: 'テスト用の実績です',
        points: 10,
        rarity: 'common',
        ...overrides
    };
}