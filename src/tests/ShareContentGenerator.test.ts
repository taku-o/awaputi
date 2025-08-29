/**
 * ShareContentGenerator テスト
 */
import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { ShareContentGenerator } from '../core/ShareContentGenerator';
import type { LocalizationManager } from '../core/LocalizationManager';

// Mock interfaces
interface MockLocalizationManager extends Partial<LocalizationManager> {
    getCurrentLanguage: jest.Mock;
    translate: jest.Mock;
}

interface ShareData {
    type?: string;
    score?: number;
    stage?: string;
    name?: string;
    description?: string;
    id?: string;
    rarity?: string;
}

interface AchievementData {
    name: string;
    description?: string;
    id?: string;
    rarity?: string;
}

interface ChallengeData {
    name: string;
    description?: string;
    type?: string;
    id?: string;
}

interface GeneratedMessage {
    message: string;
    platform: string;
    language: string;
    metadata: {
        originalScore?: number;
        achievementId?: string;
        challengeType?: string;
        isFallback?: boolean;
        isCustom?: boolean;
        isRare?: boolean;
        optimized?: boolean;
    };
}

describe('ShareContentGenerator', () => {
    let shareContentGenerator: ShareContentGenerator;
    let mockLocalizationManager: MockLocalizationManager;

    beforeEach(async () => {
        // LocalizationManagerのモック
        mockLocalizationManager = {
            getCurrentLanguage: jest.fn().mockReturnValue('ja'),
            translate: jest.fn().mockImplementation((key: string) => key)
        };
        
        // Navigatorのモック
        Object.defineProperty(navigator, 'language', {
            writable: true,
            value: 'ja-JP'
        });

        // Windowのモック
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'https://test.example.com',
                pathname: '/game'
            },
            writable: true
        });

        const { ShareContentGenerator } = await import('../core/ShareContentGenerator.js');
        shareContentGenerator = new ShareContentGenerator(mockLocalizationManager as any);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('初期化', () => {
        test('正常に初期化される', () => {
            expect((shareContentGenerator as any).localizationManager).toBe(mockLocalizationManager);
            expect((shareContentGenerator as any).templates).toBeDefined();
            expect(shareContentGenerator.platformLimits).toBeDefined();
            expect(shareContentGenerator.stats.generated).toBe(0);
        });

        test('テンプレートが適切に初期化される', () => {
            expect((shareContentGenerator as any).templates.score).toBeDefined();
            expect((shareContentGenerator as any).templates.achievement).toBeDefined();
            expect((shareContentGenerator as any).templates.challenge).toBeDefined();
            // 日本語テンプレートの確認
            expect((shareContentGenerator as any).templates.score.twitter.ja).toContain('{score}');
            expect((shareContentGenerator as any).templates.achievement.facebook.ja).toContain('実績');
        });

        test('プラットフォーム制限が設定される', () => {
            expect(shareContentGenerator.platformLimits.twitter.maxLength).toBe(280);
            expect(shareContentGenerator.platformLimits.facebook.maxLength).toBe(63206);
            expect(shareContentGenerator.platformLimits.generic.maxLength).toBe(1000);
        });
    });

    describe('スコア共有メッセージ生成', () => {
        test('基本的なスコアメッセージが生成される', () => {
            const scoreData: ShareData = { score: 1500, stage: 'normal' };

            const result = shareContentGenerator.generateScoreMessage(scoreData);
            expect(result.message).toContain('1,500');
            expect(result.platform).toBe('generic');
            expect(result.language).toBe('ja');
            expect(result.metadata.originalScore).toBe(1500);
        });

        test('Twitter向けメッセージが生成される', () => {
            const scoreData: ShareData = { score: 2000, stage: 'hard' };
            const result = shareContentGenerator.generateScoreMessage(scoreData, 'twitter');
            expect(result.message).toContain('2,000');
            expect(result.message).toContain('#BubblePop');
            expect(result.platform).toBe('twitter');
        });

        test('Facebook向けメッセージが生成される', () => {
            const scoreData: ShareData = { score: 3000, stage: 'expert' };
            const result = shareContentGenerator.generateScoreMessage(scoreData, 'facebook');
            expect(result.message).toContain('3,000');
            expect(result.platform).toBe('facebook');
        });

        test('英語メッセージが生成される', () => {
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('en');
            const scoreData: ShareData = { score: 1200 };
            const result = shareContentGenerator.generateScoreMessage(scoreData, 'twitter');
            expect(result.message).toContain('scored');
            expect(result.message).toContain('1,200');
            expect(result.language).toBe('en');
        });

        test('不正なスコアデータでエラーハンドリングされる', () => {
            const result = shareContentGenerator.generateScoreMessage(null as any);
            expect(result.metadata.isFallback).toBe(true);
            expect(shareContentGenerator.stats.errors).toBe(1);
        });

        test('Twitter文字数制限が適用される', () => {
            const longScore = 999999999;
            const scoreData: ShareData = { score: longScore, stage: 'super-ultra-long-stage-name-that-exceeds-limits' };
            const result = shareContentGenerator.generateScoreMessage(scoreData, 'twitter');
            expect(result.message.length).toBeLessThanOrEqual(280);
        });
    });

    describe('実績共有メッセージ生成', () => {
        test('基本的な実績メッセージが生成される', () => {
            const achievementData: AchievementData = {
                name: 'スコアマスター',
                description: '累計スコア10万点達成',
                id: 'score_master'
            };

            const result = shareContentGenerator.generateAchievementMessage(achievementData);
            expect(result.message).toContain('スコアマスター');
            expect(result.platform).toBe('generic');
            expect(result.metadata.achievementId).toBe('score_master');
        });

        test('レジェンダリー実績に絵文字が追加される', () => {
            const achievementData: AchievementData = {
                name: 'レジェンド',
                rarity: 'legendary',
                id: 'legend'
            };

            const result = shareContentGenerator.generateAchievementMessage(achievementData, 'twitter');
            expect(result.message).toMatch(/[✨🎉👑🏆⭐]/);
            expect(result.metadata.isRare).toBe(true);
        });

        test('中国語実績メッセージが生成される', () => {
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('zh-CN');
            const achievementData: AchievementData = { name: '成就大师', id: 'master' };
            const result = shareContentGenerator.generateAchievementMessage(achievementData, 'twitter');
            expect(result.message).toContain('成就大师');
            expect(result.language).toBe('zh-CN');
        });

        test('不正な実績データでフォールバックされる', () => {
            const result = shareContentGenerator.generateAchievementMessage({} as any);
            expect(result.metadata.isFallback).toBe(true);
            expect(shareContentGenerator.stats.errors).toBe(1);
        });
    });

    describe('チャレンジ共有メッセージ生成', () => {
        test('基本的なチャレンジメッセージが生成される', () => {
            const challengeData: ChallengeData = {
                name: 'デイリーマスター',
                description: '連続5日プレイ',
                type: 'daily',
                id: 'daily_master'
            };

            const result = shareContentGenerator.generateChallengeMessage(challengeData);
            expect(result.message).toContain('デイリーマスター');
            expect(result.metadata.challengeType).toBe('daily');
        });

        test('韓国語チャレンジメッセージが生成される', () => {
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('ko');
            const challengeData: ChallengeData = { name: '챌린지 마스터', type: 'weekly' };
            const result = shareContentGenerator.generateChallengeMessage(challengeData, 'twitter');
            expect(result.message).toContain('챌린지 마스터');
            expect(result.language).toBe('ko');
        });
    });

    describe('カスタムメッセージ生成', () => {
        test('カスタムテンプレートでメッセージが生成される', () => {
            const customTemplate = '{name}さんが{score}点を達成！{url}';
            const data = { name: 'テストユーザー', score: 1000 };
            const result = shareContentGenerator.generateCustomMessage('custom', data, customTemplate);
            expect(result.message).toContain('テストユーザー');
            expect(result.message).toContain('1000');
            expect(result.metadata.isCustom).toBe(true);
        });

        test('危険なテンプレートが拒否される', () => {
            const dangerousTemplate = '<script>alert("xss")</script>{score}';
            const data = { score: 1000 };
            const result = shareContentGenerator.generateCustomMessage('custom', data, dangerousTemplate);
            expect(result.metadata.isFallback).toBe(true);
            expect(shareContentGenerator.stats.errors).toBe(1);
        });
    });

    describe('テンプレート補間', () => {
        test('基本的な変数置換が動作する', () => {
            const template = 'Hello {name}, your score is {score}!';
            const data = { name: 'Player', score: 1500 };

            const result = (shareContentGenerator as any).interpolateTemplate(template, data);
            expect(result).toBe('Hello Player, your score is 1500!');
        });

        test('未定義変数が削除される', () => {
            const template = 'Score: {score}, Bonus: {bonus}';
            const data = { score: 1000 };

            const result = (shareContentGenerator as any).interpolateTemplate(template, data);
            expect(result).toBe('Score: 1000, Bonus: ');
        });

        test('余分な空白が削除される', () => {
            const template = 'Score: {score}   points   !';
            const data = { score: 1000 };

            const result = (shareContentGenerator as any).interpolateTemplate(template, data);
            expect(result).toBe('Score: 1000 points !');
        });
    });

    describe('プラットフォーム最適化', () => {
        test('Twitter向け最適化が動作する', () => {
            const longMessage = 'A'.repeat(300) + ' #BubblePop #Game #Test #Extra https://example.com';
            const result = shareContentGenerator.optimizeForPlatform(longMessage, 'twitter');
            expect(result.length).toBeLessThanOrEqual(280);
            // ハッシュタグ数制限の確認
            const hashtags = result.match(/#\w+/g) || [];
            expect(hashtags.length).toBeLessThanOrEqual(2);
        });

        test('Facebook向け最適化が動作する', () => {
            const longMessage = 'A'.repeat(100000);
            const result = shareContentGenerator.optimizeForPlatform(longMessage, 'facebook');
            expect(result.length).toBeLessThanOrEqual(63206);
        });

        test('汎用最適化が動作する', () => {
            const longMessage = 'A'.repeat(2000);
            const result = shareContentGenerator.optimizeForPlatform(longMessage, 'generic');
            expect(result.length).toBeLessThanOrEqual(1000);
        });
    });

    describe('ユーティリティ機能', () => {
        test('プラットフォーム名が正規化される', () => {
            expect((shareContentGenerator as any).normalizePlatform('X')).toBe('twitter');
            expect((shareContentGenerator as any).normalizePlatform('twitter-x')).toBe('twitter');
            expect((shareContentGenerator as any).normalizePlatform('FB')).toBe('facebook');
            expect((shareContentGenerator as any).normalizePlatform('web-share')).toBe('generic');
        });

        test('スコアが適切にフォーマットされる', () => {
            expect(shareContentGenerator.formatScore(1000)).toBe('1,000');
            expect(shareContentGenerator.formatScore(1234567)).toBe('1,234,567');
        });

        test('現在の言語が取得される', () => {
            const language = (shareContentGenerator as any).getCurrentLanguage();
            expect(language).toBe('ja');
            // LocalizationManagerが無い場合のフォールバック
            (shareContentGenerator as any).localizationManager = null as any;
            const fallbackLanguage = (shareContentGenerator as any).getCurrentLanguage();
            expect(fallbackLanguage).toBe('ja'); // navigator.languageからの抽出
        });

        test('ゲームURLが取得される', () => {
            const url = shareContentGenerator.getGameUrl();
            expect(url).toBe('https://test.example.com/game');
        });

        test('メッセージが適切に短縮される', () => {
            const message = 'This is a very long message that needs to be truncated';
            const result = shareContentGenerator.truncateMessage(message, 20);
            expect(result.length).toBeLessThanOrEqual(20);
            expect(result).toMatch(/\.\.\.$/);
        });

        test('テンプレートの安全性チェックが動作する', () => {
            expect(shareContentGenerator.validateTemplate('Hello {name}')).toBe(true);
            expect(shareContentGenerator.validateTemplate('<script>alert("xss")</script>')).toBe(false);
            expect(shareContentGenerator.validateTemplate('javascript:alert("xss")')).toBe(false);
            expect(shareContentGenerator.validateTemplate('<iframe src="evil.com"></iframe>')).toBe(false);
        });
    });

    describe('統計機能', () => {
        test('統計情報が正確に記録される', () => {
            const scoreData: ShareData = { score: 1000 };
            shareContentGenerator.generateScoreMessage(scoreData);
            shareContentGenerator.generateScoreMessage(null as any); // エラーを発生させる
            
            const stats = shareContentGenerator.getStats();
            expect(stats.generated).toBe(2);
            expect(stats.errors).toBe(1);
            expect(stats.successRate).toBe(50);
        });

        test('統計がリセットされる', () => {
            shareContentGenerator.stats.generated = 10;
            shareContentGenerator.stats.errors = 2;
            
            shareContentGenerator.resetStats();
            expect(shareContentGenerator.stats.generated).toBe(0);
            expect(shareContentGenerator.stats.errors).toBe(0);
        });
    });

    describe('多言語対応', () => {
        test('すべてのサポート言語でメッセージが生成される', () => {
            const languages = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];
            const scoreData: ShareData = { score: 1000 };

            languages.forEach(lang => {
                mockLocalizationManager.getCurrentLanguage.mockReturnValue(lang);
                const result = shareContentGenerator.generateScoreMessage(scoreData, 'twitter');
                expect(result.language).toBe(lang);
                expect(result.message).toBeTruthy();
            });
        });

        test('実績レア度が言語別に表示される', () => {
            const achievementData: AchievementData = { name: 'Test', rarity: 'legendary' };
            
            mockLocalizationManager.getCurrentLanguage.mockReturnValue('en');
            const enRarity = shareContentGenerator.getAchievementRarity(achievementData);
            expect(enRarity).toBe('Legendary');

            mockLocalizationManager.getCurrentLanguage.mockReturnValue('ja');
            const jaRarity = shareContentGenerator.getAchievementRarity(achievementData);
            expect(jaRarity).toBe('レジェンダリー');
        });
    });

    describe('デバッグ機能', () => {
        test('デバッグ情報が取得される', () => {
            const debugInfo = shareContentGenerator.getDebugInfo();
            expect(debugInfo).toHaveProperty('templates');
            expect(debugInfo).toHaveProperty('platforms');
            expect(debugInfo).toHaveProperty('currentLanguage');
            expect(debugInfo).toHaveProperty('stats');
            expect(debugInfo.localizationManager).toBe(true);
        });
    });
});